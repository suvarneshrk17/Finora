import { body } from 'express-validator';
import mongoose from 'mongoose';

const statuses = ['active', 'closed', 'cancelled'];

export const createLoanValidator = [
  body('customer').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid customer id is required'),
  body('principal').isFloat({ min: 1 }).withMessage('Principal must be greater than 0'),
  body('monthlyInterestRate').isFloat({ min: 0, max: 100 }).withMessage('Monthly interest must be between 0 and 100'),
  body('durationMonths').isInt({ min: 1, max: 120 }).withMessage('Duration must be between 1 and 120 months'),
  body('interestType').optional().isIn(['simple', 'compound']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('status').optional().isIn(statuses),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

export const updateLoanValidator = [
  body('principal').optional().isFloat({ min: 1 }),
  body('outstanding').optional().isFloat({ min: 0 }),
  body('monthlyInterestRate').optional().isFloat({ min: 0, max: 100 }),
  body('durationMonths').optional().isInt({ min: 1, max: 120 }),
  body('interestType').optional().isIn(['simple', 'compound']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(statuses),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

export const interestCalculatorValidator = [
  body('principal').optional().isFloat({ min: 1 }),
  body('monthlyInterestRate').optional().isFloat({ min: 0, max: 100 }),
  body('calculationDate').optional().isISO8601(),
];

export const closeLoanValidator = [
  body('closureNotes').optional().trim().isLength({ max: 1000 }),
];

export const cancelLoanValidator = [
  body('cancellationReason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ max: 1000 }),
];

export const markLoanPaidValidator = [
  body('method').optional().isIn(['cash', 'upi', 'bank_transfer', 'card', 'cheque']),
  body('paidAt').optional().isISO8601(),
  body('notes').optional().trim().isLength({ max: 500 }),
];
