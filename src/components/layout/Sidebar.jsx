import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeIndianRupee,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  CreditCard,
  ReceiptText,
  UsersRound,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: UsersRound },
  { label: 'Loans', path: '/loans', icon: BadgeIndianRupee },
  { label: 'EMI Tracking', path: '/emi', icon: ClipboardList },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="mt-8 space-y-2">
      {navItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition',
              isActive
                ? 'bg-gradient-to-r from-aqua via-mint to-gold text-ink shadow-glow ring-1 ring-mint/35'
                : 'text-slate-300 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_24px_rgba(244,199,107,0.08)]',
            ].join(' ')
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-aqua via-mint to-gold text-ink shadow-glow">
        <ReceiptText className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xl font-extrabold tracking-normal text-white">Finora</p>
        <p className="text-xs font-medium text-slate-400">Loan Intelligence</p>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-ink/90 px-5 py-6 backdrop-blur-xl lg:block">
        <Brand />
        <NavItems />
        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-line bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">Office Mode</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Daily diary for active customers, dues, collections, and clear records.
          </p>
        </div>
      </aside>

      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      <motion.aside
        className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-ink px-5 py-6 shadow-panel lg:hidden"
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            className="focus-ring rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavItems onNavigate={onClose} />
      </motion.aside>
    </>
  );
}
