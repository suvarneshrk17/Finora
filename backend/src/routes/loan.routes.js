import { Router } from 'express';
import {
  calculateCompound,
  calculateSimple,
  cancelLoan,
  closeLoan,
  createLoan,
  getLoan,
  getLoans,
  markLoanPaid,
  updateLoan,
} from '../controllers/loan.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  createLoanValidator,
  interestCalculatorValidator,
  cancelLoanValidator,
  closeLoanValidator,
  markLoanPaidValidator,
  updateLoanValidator,
} from '../validators/loan.validators.js';

const router = Router();

router.use(protect);

router.route('/').get(getLoans).post(createLoanValidator, validate, createLoan);

router.post(
  '/:id/calculate/simple-interest',
  mongoIdParam(),
  interestCalculatorValidator,
  validate,
  calculateSimple,
);
router.post(
  '/:id/calculate/compound-interest',
  mongoIdParam(),
  interestCalculatorValidator,
  validate,
  calculateCompound,
);
router.patch('/:id/close', mongoIdParam(), closeLoanValidator, validate, closeLoan);
router.patch('/:id/cancel', mongoIdParam(), cancelLoanValidator, validate, restrictTo('admin', 'manager'), cancelLoan);
router.patch('/:id/mark-paid', mongoIdParam(), markLoanPaidValidator, validate, markLoanPaid);

router
  .route('/:id')
  .get(mongoIdParam(), validate, getLoan)
  .patch(mongoIdParam(), updateLoanValidator, validate, updateLoan);

export default router;
