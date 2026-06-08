import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    loanNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    principal: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: 1,
    },
    outstanding: {
      type: Number,
      min: 0,
    },
    monthlyInterestRate: {
      type: Number,
      required: [true, 'Monthly interest percentage is required'],
      min: 0,
      max: 100,
    },
    interestType: {
      type: String,
      enum: ['simple', 'compound'],
      default: 'simple',
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
      max: 120,
      default: 1,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    nextDueDate: Date,
    monthlyInterestAmount: {
      type: Number,
      min: 0,
    },
    disbursedAmount: {
      type: Number,
      min: 0,
    },
    maturityAmount: {
      type: Number,
      min: 0,
    },
    paidPeriods: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastPaidAt: Date,
    closedAt: Date,
    closureNotes: String,
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'cancelled'],
      default: 'active',
    },
    notes: String,
    interestHistory: [
      {
        interestType: {
          type: String,
          enum: ['simple', 'compound'],
          required: true,
        },
        principal: Number,
        monthlyInterestRate: Number,
        monthsElapsed: Number,
        interest: Number,
        totalAmount: Number,
        pendingBalance: Number,
        calculatedAt: {
          type: Date,
          default: Date.now,
        },
        calculatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

loanSchema.pre('validate', function setDefaults(next) {
  if (this.outstanding === undefined) {
    this.outstanding = this.principal;
  }

  if (!this.loanNumber) {
    this.loanNumber = `LN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  this.monthlyInterestAmount = Math.round((this.principal * this.monthlyInterestRate) / 100);
  this.disbursedAmount = Math.max(0, this.principal - this.monthlyInterestAmount);
  this.maturityAmount = this.principal + this.monthlyInterestAmount;

  if (!this.dueDate && this.startDate && this.durationMonths) {
    const maturityDate = new Date(this.startDate);
    maturityDate.setMonth(maturityDate.getMonth() + this.durationMonths);
    this.dueDate = maturityDate;
  }

  if (!this.nextDueDate) {
    const firstDueDate = new Date(this.startDate);
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    this.nextDueDate = firstDueDate;
  }

  next();
});

loanSchema.index({ customer: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('Loan', loanSchema);
