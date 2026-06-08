import { useState } from 'react';
import { CreditCard, Plus, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table from '../components/ui/Table.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { emisApi, loansApi, paymentsApi } from '../services/apiClient.js';
import { mapEmi, mapLoan, mapPayment } from '../utils/dataMappers.js';
import { currency } from '../utils/formatters.js';
import { Field, Select } from './Customers.jsx';

const initialForm = {
  loan: '',
  customer: '',
  emi: '',
  amount: 10000,
  method: 'upi',
  transactionRef: '',
  status: 'success',
};

export default function Payments() {
  const paymentsResource = useApiResource(paymentsApi.list, (response) => response.data.payments.map(mapPayment));
  const loansResource = useApiResource(loansApi.list, (response) => response.data.loans.map(mapLoan));
  const emisResource = useApiResource(emisApi.list, (response) => response.data.emis.map(mapEmi));
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    const loan = loansResource.data[0];
    const emi = emisResource.data.find((item) => item.loan?._id === loan?.id || item.loan === loan?.id);
    setForm({
      ...initialForm,
      loan: loan?.id || '',
      customer: loan?.customer?._id || loan?.customer || '',
      emi: emi?.id || '',
      amount: emi?.amount || initialForm.amount,
    });
    setModalOpen(true);
  }

  function selectLoan(loanId) {
    const loan = loansResource.data.find((item) => item.id === loanId);
    setForm((current) => ({
      ...current,
      loan: loanId,
      customer: loan?.customer?._id || loan?.customer || '',
      amount: current.amount,
    }));
  }

  async function createPayment(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form, emi: form.emi || null };
      await paymentsApi.create(payload);
      toast.success('Payment recorded');
      setModalOpen(false);
      await Promise.all([paymentsResource.refresh(), loansResource.refresh(), emisResource.refresh()]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function refund(payment) {
    try {
      await paymentsApi.refund(payment.id);
      toast.success('Payment refunded');
      await paymentsResource.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const payments = paymentsResource.data;
  const collected = payments.filter((payment) => payment.status === 'success').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const refunded = payments.filter((payment) => payment.status === 'refunded').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Payment Tracking"
        title="Payment History"
        description="Normal monthly collections are saved automatically from Mark Paid. Use manual records only for adjustments."
        action={
          <button onClick={openCreate} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink shadow-glow hover:bg-mint/90">
            <Plus className="h-4 w-4" />
            Add Adjustment
          </button>
        }
      />

      <ErrorBanner message={paymentsResource.error || loansResource.error || emisResource.error} onRetry={() => { paymentsResource.refresh(); loansResource.refresh(); emisResource.refresh(); }} />
      {paymentsResource.loading && <LoadingState label="Loading payments..." />}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Collected', currency(collected)],
          ['Refunded', currency(refunded)],
          ['Transactions', payments.length],
        ].map(([label, value]) => (
          <article key={label} className="glass-panel rounded-lg p-5">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-mint/12 text-mint">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </article>
        ))}
      </section>

      <Table
        columns={['Customer', 'Loan', 'Amount', 'Method', 'Paid At', 'Status', 'Actions']}
        rows={payments}
        renderRow={(payment) => (
          <tr key={payment.id} className="transition hover:bg-white/[0.035]">
            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">{payment.customerName}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{payment.loanNumber}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">{currency(payment.amount)}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{payment.methodLabel}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{payment.paidAtLabel}</td>
            <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={payment.statusLabel} /></td>
            <td className="whitespace-nowrap px-5 py-4">
              <button
                type="button"
                onClick={() => refund(payment)}
                className="focus-ring rounded-lg border border-line bg-white/[0.045] p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Refund payment"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )}
      />

      {modalOpen && (
        <Modal title="Record Payment" onClose={() => setModalOpen(false)}>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={createPayment}>
            <Select label="Loan" value={form.loan} options={loansResource.data.map((loan) => ({ value: loan.id, label: `${loan.loanNumber} - ${loan.borrower}` }))} onChange={selectLoan} />
            <Select label="EMI" value={form.emi} options={[{ value: '', label: 'No EMI link' }, ...emisResource.data.map((emi) => ({ value: emi.id, label: `${emi.loanNumber} - ${emi.customerName}` }))]} onChange={(emi) => setForm((current) => ({ ...current, emi }))} />
            <Field label="Collected Amount" type="number" value={form.amount} onChange={(amount) => setForm((current) => ({ ...current, amount: Number(amount) }))} />
            <Select label="Payment Method" value={form.method} options={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'card', label: 'Card' }, { value: 'cheque', label: 'Cheque' }]} onChange={(method) => setForm((current) => ({ ...current, method }))} />
            <button type="submit" disabled={saving || !form.loan} className="focus-ring rounded-lg bg-mint px-4 py-3 text-sm font-bold text-ink shadow-glow disabled:opacity-60 sm:col-span-2">
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </Modal>
      )}
    </Page>
  );
}
