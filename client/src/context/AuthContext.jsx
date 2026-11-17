import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth.api.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // initial check

  /* ── Restore session on mount ── */
  useEffect(() => {
    const token = localStorage.getItem('tf_access_token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      authAPI.me()
        .then(({ data }) => setUser(data.data.user))
        .catch(() => localStorage.removeItem('tf_access_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Listen for forced logout (e.g., refresh token expired)
    const handler = () => { setUser(null); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { accessToken, user: u } = data.data;
    localStorage.setItem('tf_access_token', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authAPI.register(payload);
    const { accessToken, user: u } = data.data;
    localStorage.setItem('tf_access_token', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) { /* ignore */ }
    localStorage.removeItem('tf_access_token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
