import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeDiaryLoan, startOfDay } from '../utils/dueDiary.js';

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const activeCustomerFilter = { status: { $ne: 'archived' } };
  const [customers, activeCustomers] = await Promise.all([
    Customer.find(activeCustomerFilter).sort({ createdAt: -1 }).limit(6),
    Customer.find(activeCustomerFilter).select('_id'),
  ]);
  const activeCustomerIds = activeCustomers.map((customer) => customer._id);

  const activeLoans = await Loan.find({
    customer: { $in: activeCustomerIds },
    status: 'active',
  })
    .populate('customer', 'name phone address')
    .sort({ createdAt: -1 });
  const [payments, monthlyPayments, closedLoans] = await Promise.all([
    Payment.find({ status: 'success' }).sort({ paidAt: -1 }),
    Payment.find({ status: 'success', paidAt: { $gte: startOfMonth } }),
    Loan.countDocuments({ customer: { $in: activeCustomerIds }, status: 'closed' }),
  ]);

  const activeDiaryLoans = activeLoans.map((loan) => ({
    ...loan.toObject(),
    diary: computeDiaryLoan(loan),
  }));
  const dueToday = activeDiaryLoans.filter((loan) => loan.diary.dueStatusType === 'today');
  const dueTomorrow = activeDiaryLoans.filter((loan) => loan.diary.dueStatusType === 'tomorrow');
  const overdueLoans = activeDiaryLoans.filter((loan) => loan.diary.dueStatusType === 'overdue');
  const pendingCollection = activeLoans.reduce((sum, loan) => sum + loan.outstanding, 0);
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyIncome = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
  res.json({
    status: 'success',
    data: {
      summaryCards: [
        { label: 'Active Loans', value: activeLoans.length, change: 'Live', tone: 'mint', spark: [0, 0, 0, 0, 0, 0, activeLoans.length] },
        { label: 'Collected Amount', value: totalCollected, change: 'Recorded collections', tone: 'aqua', spark: [0, 0, 0, 0, 0, 0, totalCollected] },
        { label: 'Pending Collection', value: pendingCollection, change: 'Open balance', tone: 'gold', spark: [0, 0, 0, 0, 0, 0, pendingCollection] },
        { label: 'Overdue Customers', value: overdueLoans.length, change: 'Needs follow-up', tone: 'rose', spark: [0, 0, 0, 0, 0, 0, overdueLoans.length] },
      ],
      metrics: {
        activeLoans: activeLoans.length,
        closedLoans,
        totalCollected,
        pendingCollection,
        overdueCustomers: overdueLoans.length,
        dueToday: dueToday.length,
        dueTomorrow: dueTomorrow.length,
        monthlyIncome,
        monthStart: startOfDay(startOfMonth),
      },
      recentCustomers: customers,
      recentLoans: activeDiaryLoans.slice(0, 6),
      dueToday,
      dueTomorrow,
      overdueLoans,
    },
  });
});
