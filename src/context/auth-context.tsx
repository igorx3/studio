'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for a stored session
    try {
      const storedUser = sessionStorage.getItem('khlothiapack-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Could not parse user from session storage', error);
      sessionStorage.removeItem('khlothiapack-user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole) => {
    const userToLogin = mockUsers[role];
    setUser(userToLogin);
    sessionStorage.setItem('khlothiapack-user', JSON.stringify(userToLogin));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('khlothiapack-user');
    router.push('/');
  };

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname.startsWith('/dashboard')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
