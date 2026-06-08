import Customer from '../models/Customer.js';
import EMI from '../models/EMI.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

function getPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function normalizeCustomerPayload(payload) {
  const normalized = { ...payload };

  ['email', 'phone', 'address', 'aadhaarNumber', 'panNumber'].forEach((field) => {
    if (typeof normalized[field] === 'string') {
      normalized[field] = normalized[field].trim();
    }

    if (normalized[field] === '') {
      delete normalized[field];
    }
  });

  return normalized;
}

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    filter.status = { $ne: 'archived' };
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    results: customers.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { customers },
  });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    ...normalizeCustomerPayload(req.body),
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { customer },
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.json({
    status: 'success',
    data: { customer },
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, normalizeCustomerPayload(req.body), {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.json({
    status: 'success',
    data: { customer },
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const activeLoanCount = await Loan.countDocuments({ customer: req.params.id, status: 'active' });

  if (activeLoanCount > 0) {
    throw new AppError('Archive blocked: customer still has active loans', 409);
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      status: 'archived',
      archivedAt: new Date(),
      archivedBy: req.user._id,
    },
    { new: true },
  );

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.json({
    status: 'success',
    data: { customer },
  });
});

export const addCustomerNote = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        notes: {
          body: req.body.body,
          createdBy: req.user._id,
        },
      },
    },
    { new: true, runValidators: true },
  );

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.status(201).json({
    status: 'success',
    data: { customer },
  });
});

export const getCustomerTimeline = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  const [loans, emis, payments] = await Promise.all([
    Loan.find({ customer: req.params.id }).sort({ createdAt: -1 }),
    EMI.find({ customer: req.params.id }).populate('loan', 'loanNumber').sort({ dueDate: -1 }),
    Payment.find({ customer: req.params.id }).populate('loan', 'loanNumber').sort({ paidAt: -1 }),
  ]);

  const timeline = [
    ...loans.map((loan) => ({
      type: 'loan',
      title: `Loan ${loan.loanNumber} ${loan.status}`,
      amount: loan.principal,
      date: loan.createdAt,
      payload: loan,
    })),
    ...emis.map((emi) => ({
      type: 'emi',
      title: `EMI ${emi.installmentNumber} ${emi.status}`,
      amount: emi.amount,
      date: emi.dueDate,
      payload: emi,
    })),
    ...payments.map((payment) => ({
      type: 'payment',
      title: `Payment ${payment.status}`,
      amount: payment.amount,
      date: payment.paidAt,
      payload: payment,
    })),
    ...customer.notes.map((note) => ({
      type: 'note',
      title: note.body,
      amount: null,
      date: note.createdAt,
      payload: note,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    status: 'success',
    data: { timeline },
  });
});
