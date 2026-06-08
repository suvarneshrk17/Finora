const dayMs = 24 * 60 * 60 * 1000;

export function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addMonths(value, months = 1) {
  const date = new Date(value);
  const day = date.getDate();
  date.setMonth(date.getMonth() + months);

  if (date.getDate() < day) {
    date.setDate(0);
  }

  return date;
}

export function daysUntil(date, from = new Date()) {
  return Math.ceil((startOfDay(date) - startOfDay(from)) / dayMs);
}

export function dueStatusLabel(date, from = new Date()) {
  const days = daysUntil(date, from);

  if (days === 0) return 'Due Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `${days} Days Left`;
  return `Overdue by ${Math.abs(days)} days`;
}

export function dueStatusType(date, from = new Date()) {
  const days = daysUntil(date, from);

  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'upcoming';
}

export function computeDiaryLoan(loan, from = new Date()) {
  const monthlyInterestAmount = Math.round((loan.principal * loan.monthlyInterestRate) / 100);
  const durationMonths = Number(loan.durationMonths || 1);
  const disbursedAmount = Math.max(0, loan.principal - monthlyInterestAmount);
  const maturityAmount = loan.principal + monthlyInterestAmount;
  const nextDueDate = loan.nextDueDate || loan.dueDate || addMonths(loan.startDate, 1);
  const remainingDays = daysUntil(nextDueDate, from);
  const paidPeriods = Number(loan.paidPeriods || 0);
  const isFinalPeriod = paidPeriods >= Math.max(0, durationMonths - 1);
  const expectedDueAmount = isFinalPeriod ? maturityAmount : monthlyInterestAmount;

  return {
    monthlyInterestAmount,
    disbursedAmount,
    maturityAmount,
    nextDueDate,
    remainingDays,
    dueStatusLabel: dueStatusLabel(nextDueDate, from),
    dueStatusType: dueStatusType(nextDueDate, from),
    expectedDueAmount,
    paidPeriods,
    durationMonths,
  };
}
