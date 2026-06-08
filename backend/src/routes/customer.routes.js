import { Router } from 'express';
import {
  createCustomer,
  addCustomerNote,
  deleteCustomer,
  getCustomer,
  getCustomers,
  getCustomerTimeline,
  updateCustomer,
} from '../controllers/customer.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam, paginationValidators } from '../validators/common.validators.js';
import {
  addCustomerNoteValidator,
  createCustomerValidator,
  updateCustomerValidator,
} from '../validators/customer.validators.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(paginationValidators, validate, getCustomers)
  .post(createCustomerValidator, validate, createCustomer);

router
  .route('/:id')
  .get(mongoIdParam(), validate, getCustomer)
  .patch(mongoIdParam(), updateCustomerValidator, validate, updateCustomer)
  .delete(mongoIdParam(), validate, restrictTo('admin', 'manager'), deleteCustomer);

router.post('/:id/notes', mongoIdParam(), addCustomerNoteValidator, validate, addCustomerNote);
router.get('/:id/timeline', mongoIdParam(), validate, getCustomerTimeline);

export default router;
