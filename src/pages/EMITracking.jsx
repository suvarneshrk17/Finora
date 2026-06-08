import { CheckCircle2, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table from '../components/ui/Table.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { loansApi } from '../services/apiClient.js';
import { mapLoan } from '../utils/dataMappers.js';
import { currency } from '../utils/formatters.js';

export default function EMITracking() {
  const loansResource = useApiResource(loansApi.list, (response) => response.data.loans.map(mapLoan));

  async function markPaid(loan) {
    try {
      await loansApi.markPaid(loan.id, { method: 'cash' });
      toast.success('Collection saved. Next due date updated.');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const activeLoans = loansResource.data.filter((loan) => loan.status === 'active');
  const dueToday = activeLoans.filter((loan) => loan.dueStatusType === 'today');
  const overdue = activeLoans.filter((loan) => loan.dueStatusType === 'overdue');
  const expected = activeLoans.reduce((sum, loan) => sum + Number(loan.expectedDueAmount || 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow="EMI Diary"
        title="Due Date Diary"
        description="No manual EMI creation needed. Monthly and maturity collections are calculated from each loan due date."
      />

      <ErrorBanner message={loansResource.error} onRetry={loansResource.refresh} />
      {loansResource.loading && <LoadingState label="Loading due diary..." />}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Due Today', dueToday.length, 'bg-mint/12 text-mint'],
          ['Overdue', overdue.length, 'bg-rose/12 text-rose'],
          ['Expected Collection', currency(expected), 'bg-gold/12 text-gold'],
        ].map(([label, value, tone]) => (
          <article key={label} className="glass-panel rounded-lg p-5">
            <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </article>
        ))}
      </section>

      {activeLoans.length === 0 && !loansResource.loading ? (
        <EmptyState title="No active loan dues" description="Active loan due dates will appear here automatically." />
      ) : (
        <Table
          columns={['Customer', 'Loan', 'Due Amount', 'Next Due Date', 'Status', 'Paid Months', 'Action']}
          rows={activeLoans}
          renderRow={(loan) => (
            <tr key={loan.id} className="transition hover:bg-white/[0.055]">
              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">{loan.borrower}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{loan.loanNumber}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-white">{currency(loan.expectedDueAmount)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{loan.nextDueDateLabel}</td>
              <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={loan.dueStatusLabel} /></td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{loan.paidPeriods}/{loan.durationMonths}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <button type="button" onClick={() => markPaid(loan)} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-3 py-2 text-xs font-bold text-ink shadow-glow hover:bg-mint/90">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Paid
                </button>
              </td>
            </tr>
          )}
        />
      )}
    </Page>
  );
}
