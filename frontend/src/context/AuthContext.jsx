import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('grantstay_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('grantstay_token');
      const storedUser = localStorage.getItem('grantstay_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify token freshness with backend /auth/me
          const response = await API.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('grantstay_user', JSON.stringify(response.data.data));
          }
        } catch (err) {
          console.error('[AuthContext] Session restore failed:', err);
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register User
  const register = async (userData) => {
    setError(null);
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data.success) {
        const { token: newToken, ...userObj } = response.data.data;
        setToken(newToken);
        setUser(userObj);
        localStorage.setItem('grantstay_token', newToken);
        localStorage.setItem('grantstay_user', JSON.stringify(userObj));
        return { success: true, data: userObj };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, ...userObj } = response.data.data;
        setToken(newToken);
        setUser(userObj);
        localStorage.setItem('grantstay_token', newToken);
        localStorage.setItem('grantstay_user', JSON.stringify(userObj));
        return { success: true, data: userObj };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      return { success: false, message };
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await API.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('grantstay_user', JSON.stringify(response.data.data));
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      return { success: false, message };
    }
  };

  // Update Password
  const updatePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const response = await API.put('/auth/password', { currentPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout User
  const logout = async () => {
    try {
      if (token) {
        await API.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout API call error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('grantstay_token');
      localStorage.removeItem('grantstay_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
