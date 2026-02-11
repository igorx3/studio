'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { auth, firestore } from '@/firebase/client';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { mockUsers } from '@/lib/data'; // for demo login roles

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setUser(userData);
        } else {
          // Create a new user profile if it doesn't exist
          const newUser: User = {
            uid: fbUser.uid,
            name: fbUser.displayName,
            email: fbUser.email,
            avatarUrl: fbUser.photoURL,
            role: 'client', // Default role
          };
          await setDoc(userDocRef, { ...newUser, createdAt: serverTimestamp() });
          setUser(newUser);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setIsLoading(false);
    }
  };

  const loginAsDemo = (role: UserRole) => {
    // This is a mock login for demo purposes.
    // It doesn't use real Firebase auth but simulates a logged-in user.
    const mockUser = mockUsers[role];
    const userWithUid = { ...mockUser, uid: role }; // Use role as UID for mock
    setUser(userWithUid as User);
    setIsLoading(false);
    router.push('/dashboard');
  }

  const logout = async () => {
    await signOut(auth);
    // for demo login
    setUser(null); 
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

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isAuthenticated, isLoading, loginWithGoogle, logout, loginAsDemo }}>
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
