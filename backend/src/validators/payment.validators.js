import { body } from 'express-validator';
import mongoose from 'mongoose';

export const createPaymentValidator = [
  body('customer').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid customer id is required'),
  body('loan').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid loan id is required'),
  body('emi')
    .optional({ nullable: true })
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Valid EMI id is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['cash', 'upi', 'bank_transfer', 'card', 'cheque']).withMessage('Invalid payment method'),
  body('transactionRef').optional().trim().isLength({ max: 120 }),
  body('paidAt').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'success', 'failed']),
  body('notes').optional().trim().isLength({ max: 500 }),
];
