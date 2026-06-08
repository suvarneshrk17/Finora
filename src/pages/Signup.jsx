import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthFrame, AuthInput } from './Login.jsx';

export default function Signup() {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await signup(form);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message, { id: 'auth-error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Create workspace" subtitle="Set up an operator account for the Finora dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          label="Full name"
          value={form.name}
          onChange={(value) => setForm((current) => ({ ...current, name: value }))}
        />
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Already have access?{' '}
        <Link className="font-bold text-mint hover:text-mint/80" to="/login">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
