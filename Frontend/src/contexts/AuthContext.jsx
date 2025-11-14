import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import SplashScreen from '../components/common/SplashScreen';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(false);
  const splashTimeoutRef = useRef(null);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    return () => {
      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
      }
    };
  }, []);

  const playSplash = useCallback(() => {
    if (splashTimeoutRef.current) {
      clearTimeout(splashTimeoutRef.current);
    }

    setSplashVisible(true);
    return new Promise((resolve) => {
      splashTimeoutRef.current = setTimeout(() => {
        setSplashVisible(false);
        splashTimeoutRef.current = null;
        resolve();
      }, 2000);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, playSplash }}>
      {children}
      <SplashScreen visible={splashVisible} />
    </AuthContext.Provider>
  );
};

