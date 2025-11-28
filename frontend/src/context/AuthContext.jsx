import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar, verifica se tem token salvo
    const token = localStorage.getItem('@InvestApp:token');
    const username = localStorage.getItem('@InvestApp:user');

    if (token && username) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ username });
    }
    setLoading(false);
  }, []);

  const signIn = async (username, password) => {
    // O FastAPI espera form-data para o endpoint /token
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData);
    const { access_token } = response.data;

    localStorage.setItem('@InvestApp:token', access_token);
    localStorage.setItem('@InvestApp:user', username);

    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser({ username });
  };

  const register = async (username, password) => {
    await api.post('/auth/register', { username, password });
    // Auto login após registro
    await signIn(username, password);
  };

  const signOut = () => {
    localStorage.removeItem('@InvestApp:token');
    localStorage.removeItem('@InvestApp:user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, register, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}