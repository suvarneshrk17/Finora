import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { addMonths, computeDiaryLoan } from '../utils/dueDiary.js';
import { calculateCompoundInterest, calculateMonthsElapsed, calculateSimpleInterest } from '../utils/interest.js';

async function loanCalculationPayload(loan, body = {}) {
  const paidAmount = await Payment.aggregate([
    { $match: { loan: loan._id, status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const calculationDate = body.calculationDate || new Date();

  return {
    principal: Number(body.principal || loan.principal),
    monthlyInterestRate: Number(body.monthlyInterestRate || loan.monthlyInterestRate),
    monthsElapsed: calculateMonthsElapsed(loan.startDate, calculationDate),
    paidAmount: paidAmount[0]?.total || 0,
  };
}

export const getLoans = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  const loans = await Loan.find(filter)
    .populate('customer', 'name email phone address')
    .sort({ createdAt: -1 });
  const decoratedLoans = loans.map((loan) => ({
    ...loan.toObject(),
    diary: computeDiaryLoan(loan),
  }));

  res.json({
    status: 'success',
    results: decoratedLoans.length,
    data: { loans: decoratedLoans },
  });
});

export const createLoan = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.body.customer);

  if (!customer || customer.status === 'archived') {
    throw new AppError('Customer not found', 404);
  }

  const previewPayload = {
    ...req.body,
    monthsElapsed: Number(req.body.durationMonths || 1),
    paidAmount: 0,
  };
  const preview =
    req.body.interestType === 'compound'
      ? calculateCompoundInterest(previewPayload)
      : calculateSimpleInterest(previewPayload);

  const loan = await Loan.create({
    ...req.body,
    dueDate: req.body.dueDate || addMonths(req.body.startDate, Number(req.body.durationMonths || 1)),
    nextDueDate: addMonths(req.body.startDate, 1),
    outstanding: req.body.principal,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { loan: { ...loan.toObject(), diary: computeDiaryLoan(loan) }, calculation: preview },
  });
});

export const getLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id).populate('customer', 'name email phone address');

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  res.json({
    status: 'success',
    data: { loan: { ...loan.toObject(), diary: computeDiaryLoan(loan) } },
  });
});

export const updateLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  res.json({
    status: 'success',
    data: { loan: { ...loan.toObject(), diary: computeDiaryLoan(loan) } },
  });
});

export const calculateSimple = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  const payload = await loanCalculationPayload(loan, req.body);
  const calculation = calculateSimpleInterest(payload);
  loan.outstanding = calculation.pendingBalance;
  loan.interestHistory.push({
    interestType: 'simple',
    ...calculation,
    calculatedBy: req.user._id,
  });
  await loan.save();

  res.json({
    status: 'success',
    data: { calculation, loan },
  });
});

export const calculateCompound = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  const payload = await loanCalculationPayload(loan, req.body);
  const calculation = calculateCompoundInterest(payload);
  loan.outstanding = calculation.pendingBalance;
  loan.interestHistory.push({
    interestType: 'compound',
    ...calculation,
    calculatedBy: req.user._id,
  });
  await loan.save();

  res.json({
    status: 'success',
    data: { calculation, loan },
  });
});

export const closeLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.outstanding > 0) {
    throw new AppError('Loan cannot be closed while pending balance is greater than zero', 409);
  }

  loan.status = 'closed';
  loan.closedAt = new Date();
  loan.closureNotes = req.body.closureNotes || '';
  await loan.save();

  res.json({
    status: 'success',
    data: { loan },
  });
});

export const cancelLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== 'active') {
    throw new AppError('Only active loans can be cancelled', 409);
  }

  loan.status = 'cancelled';
  loan.outstanding = 0;
  loan.cancelledAt = new Date();
  loan.cancellationReason = req.body.cancellationReason;
  loan.cancelledBy = req.user._id;
  await loan.save();

  res.json({
    status: 'success',
    data: { loan },
  });
});

export const markLoanPaid = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status === 'closed') {
    throw new AppError('Loan is already closed', 409);
  }

  const diary = computeDiaryLoan(loan);
  const paidAt = req.body.paidAt ? new Date(req.body.paidAt) : new Date();
  const payment = await Payment.create({
    customer: loan.customer,
    loan: loan._id,
    amount: diary.expectedDueAmount,
    method: req.body.method || 'cash',
    paidAt,
    status: 'success',
    collectionType: diary.paidPeriods >= diary.durationMonths - 1 ? 'maturity' : 'monthly_interest',
    periodNumber: diary.paidPeriods + 1,
    notes: req.body.notes || diary.dueStatusLabel,
    receivedBy: req.user._id,
  });

  loan.paidPeriods += 1;
  loan.lastPaidAt = paidAt;

  if (loan.paidPeriods >= loan.durationMonths) {
    loan.status = 'closed';
    loan.outstanding = 0;
    loan.closedAt = paidAt;
    loan.closureNotes = 'Closed after maturity payment';
  } else {
    loan.outstanding = loan.principal;
    loan.nextDueDate = addMonths(loan.nextDueDate || loan.dueDate, 1);
  }

  await loan.save();

  res.json({
    status: 'success',
    data: {
      payment,
      loan: { ...loan.toObject(), diary: computeDiaryLoan(loan) },
    },
  });
});
