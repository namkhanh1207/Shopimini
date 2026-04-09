import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading]   = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/customer/me');
      setCustomer(res.data.customer);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const login = async (email, password) => {
    const res = await api.post('/customer/login', { email, password });
    setCustomer(res.data.customer);
    return res.data.customer;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/customer/register', { username, email, password });
    setCustomer(res.data.customer);
    return res.data.customer;
  };

  const logout = async () => {
    await api.post('/customer/logout');
    setCustomer(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/customer/me', data);
    setCustomer(res.data.customer);
    return res.data.customer;
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout, reload, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
