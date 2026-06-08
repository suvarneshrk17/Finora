import { param, query } from 'express-validator';
import mongoose from 'mongoose';

export const mongoIdParam = (field = 'id') =>
  param(field).custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid MongoDB id');

export const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 120 }).withMessage('Search is too long'),
];
