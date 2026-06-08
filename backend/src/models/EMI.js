import mongoose from 'mongoose';

const emiSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    installmentNumber: {
      type: Number,
      required: [true, 'Installment number is required'],
      min: 1,
    },
    amount: {
      type: Number,
      required: [true, 'EMI amount is required'],
      min: 1,
    },
    principalComponent: {
      type: Number,
      min: 0,
      default: 0,
    },
    interestComponent: {
      type: Number,
      min: 0,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'due', 'paid', 'partial', 'overdue', 'waived'],
      default: 'scheduled',
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lateFee: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

emiSchema.index({ loan: 1, installmentNumber: 1 }, { unique: true });
emiSchema.index({ customer: 1, dueDate: 1, status: 1 });

export default mongoose.model('EMI', emiSchema);
