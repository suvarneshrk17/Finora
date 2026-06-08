import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan is required'],
    },
    emi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EMI',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 1,
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque'],
      required: [true, 'Payment method is required'],
    },
    transactionRef: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
    },
    collectionType: {
      type: String,
      enum: ['monthly_interest', 'maturity', 'manual', 'adjustment', 'refund'],
      default: 'manual',
    },
    periodNumber: Number,
    notes: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

paymentSchema.index({ loan: 1, paidAt: -1 });
paymentSchema.index({ customer: 1, paidAt: -1 });

export default mongoose.model('Payment', paymentSchema);
