import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication token is required', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      'Database is not connected. In MongoDB Atlas, open Network Access, add your current IP address, then restart the backend.',
      503,
    );
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new AppError('Authenticated user no longer exists or is inactive', 401);
  }

  req.user = user;
  next();
});

export function restrictTo(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }

    next();
  };
}
