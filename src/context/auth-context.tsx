'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // On initial load, try to get user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('demo-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem('demo-user');
    }
    setIsLoading(false);
  }, []);
  
  const loginAs = (role: UserRole) => {
    setIsLoading(true);
    const userToLogin = mockUsers[role];
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('demo-user', JSON.stringify(userToLogin));
      router.push('/dashboard');
    } else {
        console.error(`No mock user found for role: ${role}`);
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null); 
    localStorage.removeItem('demo-user');
    router.push('/');
  };

  const isAuthenticated = !!user;

  // Protect routes
  useEffect(() => {
    const isAuthPage = pathname === '/';
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.replace('/');
      } else if (isAuthenticated && isAuthPage) {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // This prevents flash of unauthenticated content
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginAs, logout }}>
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
