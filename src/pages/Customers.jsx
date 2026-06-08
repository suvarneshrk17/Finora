import { useEffect, useState } from 'react';
import { Archive, Clock3, Edit3, MessageSquarePlus, Search, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Page, PageHeader } from '../components/ui/Page.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table from '../components/ui/Table.jsx';
import useApiResource from '../hooks/useApiResource.js';
import { customersApi } from '../services/apiClient.js';
import { mapCustomer } from '../utils/dataMappers.js';

const initialForm = {
  name: '',
  phone: '',
  address: '',
  aadhaarNumber: '',
  panNumber: '',
  status: 'active',
};

function cleanCustomerPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== ''),
  );
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, error, refresh } = useApiResource(
    () => customersApi.list(search, statusFilter),
    (response) => response.data.customers.map(mapCustomer),
  );
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [note, setNote] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, [statusFilter, refresh]);

  async function runSearch(event) {
    event.preventDefault();
    await refresh();
  }

  function openCreate() {
    setModal({ type: 'form', mode: 'create' });
    setForm(initialForm);
  }

  function openEdit(customer) {
    setModal({ type: 'form', mode: 'edit', customer });
    setForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address,
      aadhaarNumber: customer.aadhaarNumber,
      panNumber: customer.panNumber,
      status: customer.status,
    });
  }

  async function openTimeline(customer) {
    setModal({ type: 'timeline', customer });
    try {
      const response = await customersApi.timeline(customer.id);
      setTimeline(response.data.timeline);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  function openNote(customer) {
    setNote('');
    setModal({ type: 'note', customer });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      if (modal.mode === 'edit') {
        await customersApi.update(modal.customer.id, cleanCustomerPayload(form));
        toast.success('Customer updated');
      } else {
        await customersApi.create(cleanCustomerPayload(form));
        toast.success('Customer added');
      }
      setModal(null);
      await refresh();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function archiveCustomer(customer) {
    try {
      await customersApi.remove(customer.id);
      toast.success('Customer archived');
      await refresh();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await customersApi.addNote(modal.customer.id, { body: note });
      toast.success('Note added');
      setModal(null);
      await refresh();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Customer Management"
        title="Customers"
        description="Maintain real customer records with phone, address, optional Aadhaar/PAN, notes, and transaction timeline."
        action={
          <button onClick={openCreate} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink shadow-glow hover:bg-mint/90">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </button>
        }
      />

      <form onSubmit={runSearch} className="glass-panel flex flex-col gap-3 rounded-lg p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer name or phone number"
            className="focus-ring h-11 w-full rounded-lg border border-line bg-white/[0.045] pl-10 pr-3 text-sm text-white"
          />
        </div>
        <button className="focus-ring rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
          Search
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter((current) => (current === 'archived' ? '' : 'archived'))}
          className="focus-ring rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
        >
          {statusFilter === 'archived' ? 'Show Active' : 'Show Archived'}
        </button>
      </form>

      <ErrorBanner message={error} onRetry={refresh} />
      {loading && <LoadingState label="Loading customers..." />}

      {data.length === 0 && !loading ? (
        <EmptyState title="No customers found" description="Your database is empty. Add a customer to begin." />
      ) : (
        <Table
          columns={['Customer', 'Phone', 'Address', 'ID Details', 'Status', 'Actions']}
          rows={data}
          renderRow={(customer) => (
            <tr key={customer.id} className="transition hover:bg-white/[0.035]">
              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">
                <div>{customer.name}</div>
                <div className="text-xs font-medium text-slate-500">{customer.email || 'No email'}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{customer.phone || '-'}</td>
              <td className="max-w-xs px-5 py-4 text-sm text-slate-300">{customer.address || '-'}</td>
              <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                <div>Aadhaar: {customer.aadhaarNumber || '-'}</div>
                <div>PAN: {customer.panNumber || '-'}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={customer.statusLabel} /></td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex gap-2">
                  <IconButton label="Edit" onClick={() => openEdit(customer)} icon={<Edit3 className="h-4 w-4" />} />
                  <IconButton label="Add note" onClick={() => openNote(customer)} icon={<MessageSquarePlus className="h-4 w-4" />} />
                  <IconButton label="Timeline" onClick={() => openTimeline(customer)} icon={<Clock3 className="h-4 w-4" />} />
                  <IconButton label="Archive" onClick={() => archiveCustomer(customer)} icon={<Archive className="h-4 w-4" />} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {modal?.type === 'form' && (
        <Modal title={modal.mode === 'edit' ? 'Edit Customer' : 'Add Customer'} onClose={() => setModal(null)}>
          <CustomerForm form={form} setForm={setForm} saving={saving} onSubmit={handleSubmit} />
        </Modal>
      )}

      {modal?.type === 'note' && (
        <Modal title={`Add Note - ${modal.customer.name}`} onClose={() => setModal(null)}>
          <form onSubmit={saveNote} className="space-y-4">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
              rows={5}
              className="focus-ring w-full rounded-lg border border-line bg-white/[0.045] p-3 text-sm text-white"
              placeholder="Write office note or follow-up comment"
            />
            <button disabled={saving} className="focus-ring rounded-lg bg-mint px-4 py-3 text-sm font-bold text-ink shadow-glow disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </Modal>
      )}

      {modal?.type === 'timeline' && (
        <Modal title={`Timeline - ${modal.customer.name}`} onClose={() => setModal(null)}>
          {timeline.length === 0 ? (
            <EmptyState title="No timeline yet" description="Loans, payments, EMIs, and notes will appear here." />
          ) : (
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={`${item.type}-${index}`} className="rounded-lg border border-line bg-white/[0.035] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-mint">{item.type}</p>
                  <p className="mt-1 font-bold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </Page>
  );
}

function CustomerForm({ form, setForm, saving, onSubmit }) {
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
      <Field label="Phone (optional)" required={false} value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
      <Field label="Aadhaar (optional)" required={false} value={form.aadhaarNumber} onChange={(aadhaarNumber) => setForm((current) => ({ ...current, aadhaarNumber }))} />
      <Field label="PAN (optional)" required={false} value={form.panNumber} onChange={(panNumber) => setForm((current) => ({ ...current, panNumber }))} />
      <label className="block sm:col-span-2">
        <span className="text-sm font-bold text-slate-300">Address</span>
        <textarea
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          rows={3}
          className="focus-ring mt-2 w-full rounded-lg border border-line bg-white/[0.045] p-3 text-sm text-white"
        />
      </label>
      <button type="submit" disabled={saving} className="focus-ring rounded-lg bg-mint px-4 py-3 text-sm font-bold text-ink shadow-glow disabled:opacity-60 sm:col-span-2">
        {saving ? 'Saving...' : 'Save Customer'}
      </button>
    </form>
  );
}

export function Field({ label, value, onChange, type = 'text', required = true }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white"
      />
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-panel px-3 text-sm text-white"
      >
        {options.map((option) => (
          <option key={typeof option === 'object' ? option.value : option} value={typeof option === 'object' ? option.value : option}>
            {(typeof option === 'object' ? option.label : option) || 'None'}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="focus-ring rounded-lg border border-line bg-white/[0.045] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      {icon}
    </button>
  );
}
