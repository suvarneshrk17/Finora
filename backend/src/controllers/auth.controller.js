import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

function sendAuthResponse(res, statusCode, user) {
  const token = signToken(user);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
}

export const register = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      'Database is not connected. In MongoDB Atlas, open Network Access, add your current IP address, then restart the backend.',
      503,
    );
  }

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'manager',
  });
  sendAuthResponse(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      'Database is not connected. In MongoDB Atlas, open Network Access, add your current IP address, then restart the backend.',
      503,
    );
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account is inactive', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendAuthResponse(res, 200, user);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user },
  });
});
