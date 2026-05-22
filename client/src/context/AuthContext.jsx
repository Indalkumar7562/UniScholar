import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('uss_user')); } catch { return null; }
  });
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('uss_dark') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('uss_lang') || 'en');

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('uss_dark', darkMode);
  }, [darkMode]);

  // Sync language selection
  useEffect(() => {
    localStorage.setItem('uss_lang', language);
  }, [language]);

  // Validate token on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('uss_token');
      if (token && user) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          await fetchProfile();
        } catch {
          logout(false);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setProfile(data.profile);
    } catch {
      setProfile(null);
    }
  };

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('uss_token', data.token);
    localStorage.setItem('uss_user', JSON.stringify(data.user));
    setUser(data.user);
    await fetchProfile();
    toast.success(data.message || 'Welcome back!');
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    localStorage.setItem('uss_token', data.token);
    localStorage.setItem('uss_user', JSON.stringify(data.user));
    setUser(data.user);
    await fetchProfile();
    toast.success(data.message || 'Account created!');
    return data;
  };

  const logout = useCallback((showMsg = true) => {
    localStorage.removeItem('uss_token');
    localStorage.removeItem('uss_user');
    setUser(null);
    setProfile(null);
    if (showMsg) toast.success('Signed out successfully');
  }, []);

  const updateProfile = (p) => setProfile(p);

  return (
    <AuthContext.Provider value={{
      user, profile, loading, darkMode, setDarkMode,
      language, setLanguage,
      login, register, logout, fetchProfile, updateProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
