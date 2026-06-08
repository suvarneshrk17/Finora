export function calculateMonthsElapsed(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = end.getFullYear() - start.getFullYear();
  const months = years * 12 + end.getMonth() - start.getMonth();
  const partialMonth = end.getDate() > start.getDate() ? 1 : 0;

  return Math.max(1, months + partialMonth);
}

export function calculateSimpleInterest({ principal, monthlyInterestRate, monthsElapsed, paidAmount = 0 }) {
  const interest = (principal * monthlyInterestRate * monthsElapsed) / 100;
  const totalAmount = principal + interest;
  const pendingBalance = Math.max(0, totalAmount - paidAmount);

  return {
    principal,
    monthlyInterestRate,
    monthsElapsed,
    interest: Math.round(interest),
    totalAmount: Math.round(totalAmount),
    paidAmount: Math.round(paidAmount),
    pendingBalance: Math.round(pendingBalance),
  };
}

export function calculateCompoundInterest({
  principal,
  monthlyInterestRate,
  monthsElapsed,
  paidAmount = 0,
}) {
  const amount = principal * Math.pow(1 + monthlyInterestRate / 100, monthsElapsed);
  const interest = amount - principal;
  const pendingBalance = Math.max(0, amount - paidAmount);

  return {
    principal,
    monthlyInterestRate,
    monthsElapsed,
    interest: Math.round(interest),
    totalAmount: Math.round(amount),
    paidAmount: Math.round(paidAmount),
    pendingBalance: Math.round(pendingBalance),
  };
}
