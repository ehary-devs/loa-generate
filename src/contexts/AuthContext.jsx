import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('siloa_token');
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) throw new Error('Invalid token');
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (data) setUser(data);
        else throw new Error('Empty user response');
      })
      .catch(() => {
        localStorage.removeItem('siloa_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    let res;
    try {
      res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      throw new Error('Gagal terhubung ke server backend. Pastikan koneksi dan server aktif.');
    }

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Respons server tidak valid (Bukan JSON). Silakan coba lagi.');
    }

    if (!res.ok) {
      throw new Error(data.error || 'Email atau kata sandi tidak valid');
    }
    
    localStorage.setItem('siloa_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('siloa_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
