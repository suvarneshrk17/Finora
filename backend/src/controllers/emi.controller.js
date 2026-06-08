import EMI from '../models/EMI.js';
import Loan from '../models/Loan.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getEmis = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.loan) {
    filter.loan = req.query.loan;
  }

  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  const emis = await EMI.find(filter)
    .populate('customer', 'name email phone')
    .populate('loan', 'loanNumber type status')
    .sort({ dueDate: 1 });

  res.json({
    status: 'success',
    results: emis.length,
    data: { emis },
  });
});

export const createEmi = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.body.loan);

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.customer.toString() !== req.body.customer) {
    throw new AppError('EMI customer must match the loan customer', 400);
  }

  const emi = await EMI.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { emi },
  });
});

export const getEmi = asyncHandler(async (req, res) => {
  const emi = await EMI.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('loan', 'loanNumber type status');

  if (!emi) {
    throw new AppError('EMI not found', 404);
  }

  res.json({
    status: 'success',
    data: { emi },
  });
});

export const updateEmi = asyncHandler(async (req, res) => {
  const emi = await EMI.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!emi) {
    throw new AppError('EMI not found', 404);
  }

  res.json({
    status: 'success',
    data: { emi },
  });
});

export const markEmiPaid = asyncHandler(async (req, res) => {
  const emi = await EMI.findById(req.params.id);

  if (!emi) {
    throw new AppError('EMI not found', 404);
  }

  emi.paidAmount = req.body.paidAmount || emi.amount;
  emi.paidDate = req.body.paidDate || new Date();
  emi.status = emi.paidAmount >= emi.amount ? 'paid' : 'partial';
  await emi.save();

  res.json({
    status: 'success',
    data: { emi },
  });
});

export const deleteEmi = asyncHandler(async (req, res) => {
  const emi = await EMI.findByIdAndDelete(req.params.id);

  if (!emi) {
    throw new AppError('EMI not found', 404);
  }

  res.status(204).send();
});
