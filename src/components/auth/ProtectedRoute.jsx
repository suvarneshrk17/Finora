import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { bootstrapping, isAuthenticated } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink text-white">
        <div className="glass-panel rounded-lg p-6 text-center">
          <p className="text-lg font-bold">Loading Finora</p>
          <p className="mt-2 text-sm text-slate-400">Checking your secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
