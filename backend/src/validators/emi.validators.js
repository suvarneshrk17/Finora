import { body } from 'express-validator';
import mongoose from 'mongoose';

export const createEmiValidator = [
  body('loan').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid loan id is required'),
  body('customer').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid customer id is required'),
  body('installmentNumber').isInt({ min: 1 }),
  body('amount').isFloat({ min: 1 }),
  body('principalComponent').optional().isFloat({ min: 0 }),
  body('interestComponent').optional().isFloat({ min: 0 }),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('status').optional().isIn(['scheduled', 'due', 'paid', 'partial', 'overdue', 'waived']),
  body('paidAmount').optional().isFloat({ min: 0 }),
  body('lateFee').optional().isFloat({ min: 0 }),
];

export const updateEmiValidator = [
  body('amount').optional().isFloat({ min: 1 }),
  body('principalComponent').optional().isFloat({ min: 0 }),
  body('interestComponent').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('paidDate').optional({ nullable: true }).isISO8601(),
  body('status').optional().isIn(['scheduled', 'due', 'paid', 'partial', 'overdue', 'waived']),
  body('paidAmount').optional().isFloat({ min: 0 }),
  body('lateFee').optional().isFloat({ min: 0 }),
];

export const markEmiPaidValidator = [
  body('paidAmount').optional().isFloat({ min: 1 }),
  body('paidDate').optional().isISO8601(),
];
