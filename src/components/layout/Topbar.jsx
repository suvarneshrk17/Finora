import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle2, IndianRupee, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { paymentsApi } from '../../services/apiClient.js';
import { mapPayment } from '../../utils/dataMappers.js';
import { currency } from '../../utils/formatters.js';

function roleLabel(role) {
  const labels = {
    admin: 'Admin',
    manager: 'Client',
    analyst: 'Staff',
  };

  return labels[role] || 'Client';
}

export default function Topbar({ onOpenSidebar }) {
  const { logout, user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const panelRef = useRef(null);
  const latestPayments = useMemo(() => payments.slice(0, 6), [payments]);

  useEffect(() => {
    function closePanel(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', closePanel);
    return () => document.removeEventListener('mousedown', closePanel);
  }, []);

  async function toggleNotifications() {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      setLoadingNotifications(true);
      try {
        const response = await paymentsApi.list();
        setPayments(response.data.payments.map(mapPayment));
      } catch {
        setPayments([]);
      } finally {
        setLoadingNotifications(false);
      }
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/78 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="focus-ring rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="focus-ring h-10 w-full rounded-lg border border-line bg-white/[0.045] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 md:max-w-md"
            placeholder="Search customers, loans, EMI IDs..."
          />
        </div>
        <div ref={panelRef} className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            className="focus-ring relative rounded-lg border border-line bg-white/[0.055] p-2 text-slate-300 shadow-sm hover:border-mint/30 hover:bg-white/10 hover:text-white"
            aria-label="Collection notifications"
            title="Collection notifications"
          >
            <Bell className="h-5 w-5" />
            {latestPayments.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold shadow-[0_0_16px_rgba(244,199,107,0.85)]" />}
          </button>

          {notificationsOpen && (
            <div className="glass-panel absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-lg p-3 shadow-panel">
              <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
                <div>
                  <p className="text-sm font-extrabold text-white">Collection Activity</p>
                  <p className="text-xs text-slate-400">Latest paid, received, and refunded records</p>
                </div>
                <span className="rounded-md bg-mint/12 px-2 py-1 text-xs font-bold text-mint">{latestPayments.length}</span>
              </div>

              {loadingNotifications ? (
                <p className="px-2 py-4 text-sm text-slate-400">Loading activity...</p>
              ) : latestPayments.length === 0 ? (
                <p className="px-2 py-4 text-sm text-slate-400">No collection activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {latestPayments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border border-line bg-white/[0.045] p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-mint/12 text-mint">
                          {payment.status === 'refunded' ? <IndianRupee className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{payment.customerName}</p>
                          <p className="text-xs text-slate-400">
                            {payment.statusLabel} {currency(payment.amount)} on {payment.paidAtLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden items-center gap-3 rounded-lg border border-line bg-white/[0.045] py-1.5 pl-2 pr-3 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-mint text-sm font-bold text-ink">
            {user?.name?.slice(0, 2).toUpperCase() || 'FN'}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">{user?.name || 'Finance Desk'}</p>
            <p className="text-xs text-slate-400">{roleLabel(user?.role)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="focus-ring rounded-lg border border-line bg-white/[0.045] p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
