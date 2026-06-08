import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: '',
    },
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    notes: [
      {
        body: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    archivedAt: Date,
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

customerSchema.index({ name: 'text', phone: 'text' });

export default mongoose.model('Customer', customerSchema);
