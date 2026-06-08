import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi, clearAuthToken, getAuthToken, setAuthToken } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!getAuthToken()) {
        setBootstrapping(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (mounted) {
          setUser(response.data.user);
        }
      } catch {
        clearAuthToken();
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await authApi.login(credentials);
    setAuthToken(response.token);
    setUser(response.data.user);
    toast.success('Welcome back to Finora');
  }

  async function signup(payload) {
    const response = await authApi.register(payload);
    setAuthToken(response.token);
    setUser(response.data.user);
    toast.success('Finora account created');
  }

  function logout() {
    clearAuthToken();
    setUser(null);
    toast.success('Signed out');
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      bootstrapping,
      login,
      signup,
      logout,
    }),
    [user, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
