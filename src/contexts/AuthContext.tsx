
"use client";

import type { User } from '@/lib/types';
import { AUTH_USERS_KEY, AUTH_CURRENT_USER_KEY } from '@/lib/storageKeys';
import useClientStorage from '@/hooks/useClientStorage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Basic "hashing" - in a real app, use bcrypt or similar
const simpleHash = (password: string) => `hashed_${password}`; 

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password_raw: string) => Promise<boolean>;
  signup: (username: string, password_raw: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [storedUsers, setStoredUsers] = useClientStorage<User[]>(AUTH_USERS_KEY, []);
  const [currentUser, setCurrentUserInternal] = useClientStorage<User | null>(AUTH_CURRENT_USER_KEY, null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on mount to initialize user state from localStorage.
    // It depends on setCurrentUserInternal, which should now be stable from useClientStorage.
    const userFromStorage = window.localStorage.getItem(AUTH_CURRENT_USER_KEY);
    if (userFromStorage) {
      try {
        setCurrentUserInternal(JSON.parse(userFromStorage));
      } catch (e) {
        // If parsing fails or item is invalid, ensure currentUser is null.
        setCurrentUserInternal(null); 
      }
    }
    // Ensure isLoading is set to false after the attempt to load from storage.
    setIsLoading(false);
  }, [setCurrentUserInternal]);


  const login = async (username: string, password_raw: string): Promise<boolean> => {
    const passwordHash = simpleHash(password_raw);
    const user = storedUsers.find(u => u.username === username && u.passwordHash === passwordHash);
    if (user) {
      setCurrentUserInternal(user);
      toast({ title: "Login Successful", description: `Welcome back, ${user.username}!` });
      router.push('/'); // Changed from replace to push for better history, though replace is fine for login.
      return true;
    }
    toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    return false;
  };

  const signup = async (username: string, password_raw: string): Promise<boolean> => {
    if (storedUsers.find(u => u.username === username)) {
      toast({ title: "Signup Failed", description: "Username already exists.", variant: "destructive" });
      return false;
    }
    const passwordHash = simpleHash(password_raw);
    const newUser: User = { id: uuidv4(), username, passwordHash };
    setStoredUsers(prevUsers => [...prevUsers, newUser]);
    toast({ title: "Signup Successful", description: "You can now log in." });
    router.push('/login');
    return true;
  };

  const logout = () => {
    setCurrentUserInternal(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };
  
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
