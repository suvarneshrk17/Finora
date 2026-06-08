import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  next(
    new AppError(
      'Validation failed',
      422,
      errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    ),
  );
}
