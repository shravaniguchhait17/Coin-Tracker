import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { name, email, picture } | null
  const [loading, setLoading] = useState(true);  // true until first /api/me resolves

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.get('/api/me');
      setUser(me);
    } catch (err) {
      setUser(null); // 401 just means "not logged in" — not an error state to show
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
