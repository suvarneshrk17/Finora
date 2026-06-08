import { FileText } from 'lucide-react';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { dashboardApi } from '../services/apiClient.js';
import { currency } from '../utils/formatters.js';

export default function Reports() {
  const { data, loading, error, refresh } = useApiResource(
    dashboardApi.summary,
    (response) => response.data.metrics,
    {
      activeLoans: 0,
      closedLoans: 0,
      totalCollected: 0,
      pendingCollection: 0,
      overdueCustomers: 0,
      monthlyIncome: 0,
    },
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Office Diary"
        title="Daily Business Summary"
        description="Plain totals for active loans, collections, pending money, overdue customers, and completed loan history."
      />

      <ErrorBanner message={error} onRetry={refresh} />
      {loading && <LoadingState label="Loading report totals..." />}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard title="Active Loans" value={data.activeLoans} />
        <ReportCard title="Closed Loans" value={data.closedLoans} />
        <ReportCard title="Collected Money" value={currency(data.totalCollected || 0)} />
        <ReportCard title="Pending Money" value={currency(data.pendingCollection || 0)} />
        <ReportCard title="Overdue Customers" value={data.overdueCustomers} />
        <ReportCard title="Monthly Income" value={currency(data.monthlyIncome || 0)} />
      </section>
    </Page>
  );
}

function ReportCard({ title, value }) {
  return (
    <article className="glass-panel rounded-lg p-5">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-mint/12 text-mint">
        <FileText className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
    </article>
  );
}
