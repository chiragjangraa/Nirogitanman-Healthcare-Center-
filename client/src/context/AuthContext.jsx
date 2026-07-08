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

      // Configure default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user:', err.response?.data?.message || err.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

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
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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
