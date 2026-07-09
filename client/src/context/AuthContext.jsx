import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // Set auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Try to restore user session — /api/auth/me works for both admin & user tokens
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session restore failed:', err.response?.data?.message || err.message);
        // Clear stale token
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Regular user login
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
      return { success: true, role: newUser.role };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  // Admin login (separate endpoint)
  const loginAdmin = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
      return { success: true, role: newUser.role };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Admin login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
