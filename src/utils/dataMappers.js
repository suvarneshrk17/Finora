export function mapCustomer(customer) {
  return {
    ...customer,
    id: customer._id || customer.id,
    exposure: customer.exposure ?? 0,
    statusLabel: toTitle(customer.status || 'active'),
    address: customer.address || '',
    aadhaarNumber: customer.aadhaarNumber || '',
    panNumber: customer.panNumber || '',
    notes: customer.notes || [],
  };
}

export function mapLoan(loan) {
  return {
    ...loan,
    id: loan._id || loan.id,
    borrower: loan.customer?.name || loan.borrower || 'Unassigned',
    phone: loan.customer?.phone || '',
    rate: loan.monthlyInterestRate ?? loan.rate ?? 0,
    statusLabel: toTitle(loan.status || 'active'),
    startDateLabel: formatDate(loan.startDate),
    dueDateLabel: formatDate(loan.dueDate),
    nextDueDateLabel: formatDate(loan.diary?.nextDueDate || loan.nextDueDate || loan.dueDate),
    monthlyInterestAmount: loan.diary?.monthlyInterestAmount ?? loan.monthlyInterestAmount ?? 0,
    maturityAmount: loan.diary?.maturityAmount ?? loan.maturityAmount ?? 0,
    disbursedAmount: loan.diary?.disbursedAmount ?? loan.disbursedAmount ?? 0,
    remainingDays: loan.diary?.remainingDays ?? 0,
    dueStatusLabel: loan.diary?.dueStatusLabel || '-',
    dueStatusType: loan.diary?.dueStatusType || 'upcoming',
    expectedDueAmount: loan.diary?.expectedDueAmount || 0,
    durationMonths: loan.diary?.durationMonths ?? loan.durationMonths ?? 1,
    paidPeriods: loan.diary?.paidPeriods ?? loan.paidPeriods ?? 0,
    interestHistory: loan.interestHistory || [],
  };
}

export function mapEmi(emi) {
  return {
    ...emi,
    id: emi._id || emi.id,
    customerName: emi.customer?.name || emi.customer || 'Customer',
    loanNumber: emi.loan?.loanNumber || emi.loan || 'Loan',
    dueDateLabel: formatDate(emi.dueDate),
    paidDateLabel: emi.paidDate ? formatDate(emi.paidDate) : '-',
    statusLabel: toTitle(emi.status || 'scheduled'),
  };
}

export function mapPayment(payment) {
  return {
    ...payment,
    id: payment._id || payment.id,
    customerName: payment.customer?.name || 'Customer',
    loanNumber: payment.loan?.loanNumber || 'Loan',
    paidAtLabel: formatDate(payment.paidAt),
    methodLabel: toTitle((payment.method || '').replace('_', ' ')),
    statusLabel: toTitle(payment.status || 'success'),
  };
}

export function toTitle(value) {
  return String(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
