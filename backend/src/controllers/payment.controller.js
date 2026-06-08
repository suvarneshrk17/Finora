import EMI from '../models/EMI.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getPayments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.loan) {
    filter.loan = req.query.loan;
  }

  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const payments = await Payment.find(filter)
    .populate('customer', 'name email phone')
    .populate('loan', 'loanNumber type')
    .populate('emi', 'installmentNumber dueDate status')
    .sort({ paidAt: -1 });

  res.json({
    status: 'success',
    results: payments.length,
    data: { payments },
  });
});

export const createPayment = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.body.loan);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.customer.toString() !== req.body.customer) {
    throw new AppError('Payment customer must match the loan customer', 400);
  }

  let emi = null;
  if (req.body.emi) {
    emi = await EMI.findById(req.body.emi);

    if (!emi) {
      throw new AppError('EMI not found', 404);
    }
  }

  const payment = await Payment.create({
    ...req.body,
    receivedBy: req.user._id,
  });

  if (payment.status === 'success') {
    loan.outstanding = Math.max(0, loan.outstanding - payment.amount);
    if (loan.outstanding === 0) {
      loan.status = 'closed';
    }
    await loan.save();
  }

  if (emi && payment.status === 'success') {
    emi.paidAmount += payment.amount;
    emi.paidDate = payment.paidAt;
    emi.status = emi.paidAmount >= emi.amount ? 'paid' : 'partial';
    await emi.save();
  }

  res.status(201).json({
    status: 'success',
    data: { payment },
  });
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('loan', 'loanNumber type')
    .populate('emi', 'installmentNumber dueDate status');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.json({
    status: 'success',
    data: { payment },
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status === 'refunded') {
    throw new AppError('Payment is already refunded', 409);
  }

  payment.status = 'refunded';
  await payment.save();

  await Loan.findByIdAndUpdate(payment.loan, {
    $inc: { outstanding: payment.amount },
  });

  if (payment.emi) {
    const emi = await EMI.findById(payment.emi);
    if (emi) {
      emi.paidAmount = Math.max(0, emi.paidAmount - payment.amount);
      emi.status = emi.paidAmount === 0 ? 'due' : 'partial';
      await emi.save();
    }
  }

  res.json({
    status: 'success',
    data: { payment },
  });
});
