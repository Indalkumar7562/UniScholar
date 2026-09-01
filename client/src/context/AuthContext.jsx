import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import { showToast } from '../utils/toastQueue';

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
      if (token) {
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
    fetchProfile().catch(() => {});
    showToast(data.message || 'Welcome back!', 'success');
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await authAPI.googleLogin({ credential });
    localStorage.setItem('uss_token', data.token);
    localStorage.setItem('uss_user', JSON.stringify(data.user));
    setUser(data.user);
    fetchProfile().catch(() => {});
    showToast(data.message || 'Logged in with Google!', 'success');
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    localStorage.setItem('uss_token', data.token);
    localStorage.setItem('uss_user', JSON.stringify(data.user));
    setUser(data.user);
    fetchProfile().catch(() => {});
    showToast(data.message || 'Account created!', 'success');
    return data;
  };

  const logout = useCallback((showMsg = true) => {
    localStorage.removeItem('uss_token');
    localStorage.removeItem('uss_user');
    setUser(null);
    setProfile(null);
    if (showMsg) showToast('Signed out successfully', 'success');
  }, []);

  const updateProfile = (p) => setProfile(p);

  const updateUser = (u) => {
    localStorage.setItem('uss_user', JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, darkMode, setDarkMode,
      language, setLanguage,
      login, register, googleLogin, logout, fetchProfile, updateProfile, updateUser,
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
