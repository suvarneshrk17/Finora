import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BadgeIndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message, { id: 'auth-error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to manage Finora lending operations.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((current) => ({ ...current, email: value }))}
        />
        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        />
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-lg bg-mint px-4 py-3 text-sm font-extrabold text-ink shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        New to Finora?{' '}
        <Link className="font-bold text-mint hover:text-mint/80" to="/signup">
          Create account
        </Link>
      </p>
    </AuthFrame>
  );
}

export function AuthFrame({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-finance-grid bg-[size:48px_48px] px-4 py-10">
      <section className="glass-panel w-full max-w-md rounded-lg p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-mint text-ink shadow-glow">
            <BadgeIndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">Finora</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Secure Access</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export function AuthInput({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <input
        className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white placeholder:text-slate-500"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}
