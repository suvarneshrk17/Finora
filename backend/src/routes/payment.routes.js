import { Router } from 'express';
import {
  createPayment,
  getPayment,
  getPayments,
  refundPayment,
} from '../controllers/payment.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validators.js';
import { createPaymentValidator } from '../validators/payment.validators.js';

const router = Router();

router.use(protect);

router.route('/').get(getPayments).post(createPaymentValidator, validate, createPayment);
router.get('/:id', mongoIdParam(), validate, getPayment);
router.post('/:id/refund', mongoIdParam(), validate, restrictTo('admin', 'manager'), refundPayment);

export default router;
