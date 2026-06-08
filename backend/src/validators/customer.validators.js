import { body } from 'express-validator';

const optionalOnUpdate = { nullable: true };

export const createCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 7, max: 20 }),
  body('address').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('aadhaarNumber').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 12, max: 12 }),
  body('panNumber').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 10, max: 10 }),
  body('status').optional().isIn(['active', 'archived']),
];

export const updateCustomerValidator = [
  body('name').optional(optionalOnUpdate).trim().notEmpty().isLength({ max: 120 }),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 7, max: 20 }),
  body('address').optional(optionalOnUpdate).trim().isLength({ max: 500 }),
  body('aadhaarNumber').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 12, max: 12 }),
  body('panNumber').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 10, max: 10 }),
  body('status').optional(optionalOnUpdate).isIn(['active', 'archived']),
];

export const addCustomerNoteValidator = [
  body('body').trim().notEmpty().withMessage('Note is required').isLength({ max: 1000 }),
];
