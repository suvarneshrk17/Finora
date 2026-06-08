import { useState } from 'react';
import { Ban, Calculator, CheckCircle2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table from '../components/ui/Table.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { customersApi, loansApi } from '../services/apiClient.js';
import { mapCustomer, mapLoan } from '../utils/dataMappers.js';
import { currency } from '../utils/formatters.js';
import { Field, Select } from './Customers.jsx';

const initialForm = {
  customer: '',
  principal: 100000,
  monthlyInterestRate: 3,
  durationMonths: 3,
  interestType: 'simple',
  startDate: new Date().toISOString().slice(0, 10),
  status: 'active',
  notes: '',
};

export default function Loans() {
  const loansResource = useApiResource(loansApi.list, (response) => response.data.loans.map(mapLoan));
  const customersResource = useApiResource(customersApi.list, (response) => response.data.customers.map(mapCustomer));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [calculation, setCalculation] = useState(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setForm({ ...initialForm, customer: customersResource.data[0]?.id || '' });
    setCalculation(null);
    setModal('create');
  }

  async function createLoan(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await loansApi.create(form);
      setCalculation(response.data.calculation);
      toast.success('Loan created');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function calculate(loan, interestType) {
    try {
      const response =
        interestType === 'compound'
          ? await loansApi.compoundInterest(loan.id)
          : await loansApi.simpleInterest(loan.id);
      setCalculation(response.data.calculation);
      setModal('calculation');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function closeLoan(loan) {
    try {
      await loansApi.close(loan.id, { closureNotes: 'Closed from finance manager dashboard' });
      toast.success('Loan closed');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function markPaid(loan) {
    try {
      await loansApi.markPaid(loan.id, { method: 'cash' });
      toast.success('Collection saved and next due date updated');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function cancelLoan(loan) {
    const cancellationReason = window.prompt(`Enter a reason to cancel loan ${loan.loanNumber}:`);

    if (!cancellationReason?.trim()) {
      return;
    }

    try {
      await loansApi.cancel(loan.id, { cancellationReason: cancellationReason.trim() });
      toast.success('Loan cancelled and removed from active totals');
      await loansResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const loans = loansResource.data;
  const activeLoans = loans.filter((loan) => loan.status === 'active');
  const closedLoans = loans.filter((loan) => loan.status === 'closed');
  const pending = activeLoans.reduce((sum, loan) => sum + Number(loan.outstanding || 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Loan Management"
        title="Loans"
        description="Give loans, set monthly interest, track due dates, calculate balance, and close completed loans."
        action={
          <button onClick={openCreate} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink shadow-glow hover:bg-mint/90">
            <Plus className="h-4 w-4" />
            Give Loan
          </button>
        }
      />

      <ErrorBanner message={loansResource.error || customersResource.error} onRetry={() => { loansResource.refresh(); customersResource.refresh(); }} />
      {loansResource.loading && <LoadingState label="Loading loans..." />}

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Active Loans" value={activeLoans.length.toLocaleString('en-IN')} />
        <Metric label="Pending Balance" value={currency(pending)} />
        <Metric label="Closed Loans" value={closedLoans.length.toLocaleString('en-IN')} />
      </section>

      {loans.length === 0 && !loansResource.loading ? (
        <EmptyState title="No loans yet" description="Add a customer first, then give the first loan." />
      ) : (
        <Table
          columns={['Loan', 'Customer', 'Amount', 'Monthly Interest', 'Next Due', 'Days Left', 'Status', 'Actions']}
          rows={loans}
          renderRow={(loan) => (
            <tr key={loan.id} className="transition hover:bg-white/[0.035]">
              <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-300">{loan.loanNumber}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">
                <div>{loan.borrower}</div>
                <div className="text-xs text-slate-500">{loan.phone || 'No phone'}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">{currency(loan.principal)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                <div>{loan.rate}%</div>
                <div className="text-xs text-slate-500">{currency(loan.monthlyInterestAmount)}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{loan.nextDueDateLabel}</td>
              <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={loan.dueStatusLabel} /></td>
              <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={loan.statusLabel} /></td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex gap-2">
                  {loan.status === 'active' && (
                    <>
                      <button type="button" onClick={() => markPaid(loan)} className="focus-ring rounded-lg bg-mint px-3 py-2 text-xs font-bold text-ink shadow-glow hover:bg-mint/90">
                        Mark Paid
                      </button>
                      <IconAction label="Simple interest" onClick={() => calculate(loan, 'simple')} icon={<Calculator className="h-4 w-4" />} />
                      <IconAction label="Compound interest" onClick={() => calculate(loan, 'compound')} icon={<Plus className="h-4 w-4" />} />
                      <IconAction label="Close loan" onClick={() => closeLoan(loan)} icon={<CheckCircle2 className="h-4 w-4" />} />
                      <IconAction label="Cancel loan" onClick={() => cancelLoan(loan)} icon={<Ban className="h-4 w-4" />} />
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {modal === 'create' && (
        <Modal title="Give Loan" onClose={() => setModal(null)}>
          <LoanForm form={form} setForm={setForm} customers={customersResource.data} saving={saving} onSubmit={createLoan} calculation={calculation} />
        </Modal>
      )}

      {modal === 'calculation' && calculation && (
        <Modal title="Interest Calculation History Entry" onClose={() => setModal(null)}>
          <CalculationResult calculation={calculation} />
        </Modal>
      )}
    </Page>
  );
}

function LoanForm({ form, setForm, customers, saving, onSubmit, calculation }) {
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Select label="Customer" value={form.customer} options={customers.map((customer) => ({ value: customer.id, label: customer.phone ? `${customer.name} - ${customer.phone}` : customer.name }))} onChange={(customer) => setForm((current) => ({ ...current, customer }))} />
      <Field label="Loan Amount" type="number" value={form.principal} onChange={(principal) => setForm((current) => ({ ...current, principal: Number(principal) }))} />
      <Field label="Monthly Interest (%)" type="number" value={form.monthlyInterestRate} onChange={(monthlyInterestRate) => setForm((current) => ({ ...current, monthlyInterestRate: Number(monthlyInterestRate) }))} />
      <Field label="Duration (months)" type="number" value={form.durationMonths} onChange={(durationMonths) => setForm((current) => ({ ...current, durationMonths: Number(durationMonths) }))} />
      <Select label="Interest Method" value={form.interestType} options={[{ value: 'simple', label: 'Simple interest' }, { value: 'compound', label: 'Compound interest' }]} onChange={(interestType) => setForm((current) => ({ ...current, interestType }))} />
      <Field label="Start Date" type="date" value={form.startDate} onChange={(startDate) => setForm((current) => ({ ...current, startDate }))} />
      <label className="block sm:col-span-2">
        <span className="text-sm font-bold text-slate-300">Notes (optional)</span>
        <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="focus-ring mt-2 w-full rounded-lg border border-line bg-white/[0.045] p-3 text-sm text-white" />
      </label>
      <button type="submit" disabled={saving || !form.customer} className="focus-ring rounded-lg bg-mint px-4 py-3 text-sm font-bold text-ink shadow-glow disabled:opacity-60 sm:col-span-2">
        {saving ? 'Saving...' : 'Save Loan'}
      </button>
      {calculation && <div className="sm:col-span-2"><CalculationResult calculation={calculation} /></div>}
    </form>
  );
}

function CalculationResult({ calculation }) {
  return (
    <div className="grid gap-3 rounded-lg border border-line bg-white/[0.035] p-4 sm:grid-cols-4">
      <Metric label="Months" value={calculation.monthsElapsed} />
      <Metric label="Interest" value={currency(calculation.interest)} />
      <Metric label="Total" value={currency(calculation.totalAmount)} />
      <Metric label="Pending" value={currency(calculation.pendingBalance)} />
    </div>
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

function IconAction({ label, icon, onClick }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="focus-ring rounded-lg border border-line bg-white/[0.045] p-2 text-slate-300 hover:bg-white/10 hover:text-white">
      {icon}
    </button>
  );
}
