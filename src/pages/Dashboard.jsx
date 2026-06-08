import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { dashboardApi } from '../services/apiClient.js';
import { mapCustomer, mapLoan } from '../utils/dataMappers.js';
import { currency } from '../utils/formatters.js';

const emptyDashboard = {
  summaryCards: [
    { label: 'Active Loans', value: 0, change: 'Live', tone: 'mint', spark: [0] },
    { label: 'Collected Amount', value: 0, change: 'All time', tone: 'aqua', spark: [0] },
    { label: 'Pending Collection', value: 0, change: 'Open balance', tone: 'gold', spark: [0] },
    { label: 'Overdue Customers', value: 0, change: 'Follow-up', tone: 'rose', spark: [0] },
  ],
  metrics: { monthlyIncome: 0, closedLoans: 0, overdueEmis: 0 },
  recentCustomers: [],
  recentLoans: [],
  dueToday: [],
  dueTomorrow: [],
  overdueLoans: [],
};

export default function Dashboard() {
  const { data: dashboard, loading, error, refresh } = useApiResource(
    dashboardApi.summary,
    (response) => response.data,
    emptyDashboard,
  );
  const recentCustomers = (dashboard.recentCustomers || []).map(mapCustomer);
  const recentLoans = (dashboard.recentLoans || []).map(mapLoan);
  const dueToday = (dashboard.dueToday || []).map(mapLoan);
  const dueTomorrow = (dashboard.dueTomorrow || []).map(mapLoan);
  const overdueLoans = (dashboard.overdueLoans || []).map(mapLoan);

  return (
    <Page>
      <PageHeader
        eyebrow="Today"
        title="Finance Office Dashboard"
        description="Daily view for active loans, collections, pending balances, overdue follow-ups, and monthly income."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/customers" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.045] px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
              <Plus className="h-4 w-4" />
              Add Customer
            </Link>
            <Link to="/loans" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink shadow-glow hover:bg-mint/90">
              <Plus className="h-4 w-4" />
              Give Loan
            </Link>
          </div>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />
      {loading && <LoadingState label="Loading business dashboard..." />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.summaryCards.map((card, index) => (
          <StatCard key={card.label} card={card} index={index} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Monthly Income" value={currency(dashboard.metrics?.monthlyIncome || 0)} />
        <Metric label="Due Today" value={(dashboard.metrics?.dueToday || 0).toLocaleString('en-IN')} tone="mint" />
        <Metric label="Tomorrow" value={(dashboard.metrics?.dueTomorrow || 0).toLocaleString('en-IN')} tone="gold" />
        <Metric label="Closed Loan History" value={(dashboard.metrics?.closedLoans || 0).toLocaleString('en-IN')} />
      </section>

      <section className="glass-panel rounded-lg p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">Due Today</h2>
            <p className="text-sm text-slate-400">Customers to collect from today</p>
          </div>
          <StatusBadge status={`${dueToday.length} Due Today`} />
        </div>
        {dueToday.length === 0 ? (
          <EmptyState title="No dues today" description="Today's diary is clear." />
        ) : (
          <DueList loans={dueToday} />
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DuePanel title="Tomorrow's Due" loans={dueTomorrow} empty="No customers due tomorrow." />
        <DuePanel title="Overdue Customers" loans={overdueLoans} empty="No overdue customers." />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Customers</h2>
            <Link to="/customers" className="text-sm font-bold text-mint">Manage</Link>
          </div>
          {recentCustomers.length === 0 ? (
            <EmptyState title="No customers yet" description="Add the first customer to begin real loan tracking." />
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="rounded-lg border border-line bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{customer.name}</p>
                      <p className="text-sm text-slate-400">{customer.phone || 'No phone'}</p>
                      <p className="mt-1 text-xs text-slate-500">{customer.address || 'No address added'}</p>
                    </div>
                    <StatusBadge status={customer.statusLabel} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Loan Follow-Up</h2>
            <Link to="/loans" className="text-sm font-bold text-mint">View loans</Link>
          </div>
          {recentLoans.length === 0 ? (
            <EmptyState title="No loans yet" description="Create a loan to see pending balance and due-date follow-up." />
          ) : (
            <div className="space-y-3">
              {recentLoans.map((loan) => (
                <div key={loan.id} className="rounded-lg border border-line bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{loan.borrower}</p>
                      <p className="text-sm text-slate-400">Due {loan.dueDateLabel} - {loan.rate}% monthly</p>
                    </div>
                    <p className="text-sm font-bold text-white">{currency(loan.outstanding)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}

function Metric({ label, value }) {
  return (
    <article className="glass-panel rounded-lg p-5">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </article>
  );
}

function DuePanel({ title, loans, empty }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-4">
        {loans.length === 0 ? <EmptyState title={empty} /> : <DueList loans={loans} />}
      </div>
    </div>
  );
}

function DueList({ loans }) {
  return (
    <div className="space-y-3">
      {loans.map((loan) => (
        <div key={loan.id} className="rounded-lg border border-line bg-white/[0.045] p-4 transition hover:border-mint/30 hover:bg-white/[0.07]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">{loan.borrower}</p>
              <p className="text-sm text-slate-400">
                Due {loan.nextDueDateLabel} - collect {currency(loan.expectedDueAmount)}
              </p>
            </div>
            <StatusBadge status={loan.dueStatusLabel} />
          </div>
        </div>
      ))}
    </div>
  );
}
