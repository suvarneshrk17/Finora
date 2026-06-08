import { Router } from 'express';
import {
  createEmi,
  deleteEmi,
  getEmi,
  getEmis,
  markEmiPaid,
  updateEmi,
} from '../controllers/emi.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validators.js';
import { createEmiValidator, markEmiPaidValidator, updateEmiValidator } from '../validators/emi.validators.js';

const router = Router();

router.use(protect);

router.route('/').get(getEmis).post(createEmiValidator, validate, createEmi);

router.patch('/:id/mark-paid', mongoIdParam(), markEmiPaidValidator, validate, markEmiPaid);

router
  .route('/:id')
  .get(mongoIdParam(), validate, getEmi)
  .patch(mongoIdParam(), updateEmiValidator, validate, updateEmi)
  .delete(mongoIdParam(), validate, restrictTo('admin'), deleteEmi);

export default router;
