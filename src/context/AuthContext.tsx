'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  userId: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: UserSession | null;
  unreadNotifications: number;
  loading: boolean;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  unreadNotifications: 0,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setUnreadNotifications(data.unreadNotifications || 0);
      } else {
        setUser(null);
        setUnreadNotifications(0);
      }
    } catch {
      setUser(null);
      setUnreadNotifications(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = (userData: UserSession) => {
    setUser(userData);
    refreshAuth();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setUnreadNotifications(0);
      router.push('/');
      router.refresh();
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        unreadNotifications,
        loading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
