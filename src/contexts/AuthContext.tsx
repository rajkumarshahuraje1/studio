
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
  const [isLoading, setIsLoading] = useState(true); // Start as true, set to false once currentUser is resolved
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect monitors the currentUser value provided by useClientStorage.
    // useClientStorage returns initialValue (null) until it's initialized from localStorage.
    // Once currentUser is either the stored user or confirmed as null (after initialization),
    // we can consider the auth state loaded.
    // The `currentUser !== undefined` check is a bit loose; a more direct signal from useClientStorage
    // about its initialization might be better, but this often works because `currentUser` will
    // change instance from the default `null` to the loaded `null` or loaded `User` object.
    // A key aspect is that useClientStorage returns `initialValue` if `!isInitialized`.
    // So, `currentUser` will be `null` (initialValue) then potentially `User` or `null` (storedValue).
    // We set isLoading to false when `currentUser` has settled from its initial state.
    // The `isInitialized` flag in `useClientStorage` handles the transition.
    // `isLoading` will be false once `useClientStorage` is initialized.
    // The `currentUser` dependency ensures this runs when `useClientStorage` finishes init.
    
    // If useClientStorage is initialized (which means currentUser is now the actual value from storage or initialValue if nothing was there)
    // then we can stop loading. The initial value of useClientStorage and the potentially loaded value can both be null.
    // The key is that `useClientStorage` has finished its first pass.
    // The `isInitialized` state within `useClientStorage` handles returning `initialValue` then `storedValue`.
    // This `useEffect` should fire when `currentUser` potentially changes after `useClientStorage` is initialized.
    if (currentUser !== undefined) { // This check is primarily to ensure the effect runs after the first render cycle.
       setIsLoading(false);
    }
  }, [currentUser]); // Depend on the currentUser value from useClientStorage


  const login = async (username: string, password_raw: string): Promise<boolean> => {
    setIsLoading(true); // Set loading true during login process
    const passwordHash = simpleHash(password_raw);
    const user = storedUsers.find(u => u.username === username && u.passwordHash === passwordHash);
    if (user) {
      setCurrentUserInternal(user);
      toast({ title: "Login Successful", description: `Welcome back, ${user.username}!` });
      router.push('/'); 
      // setIsLoading(false) will be handled by the useEffect watching currentUser
      return true;
    }
    toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    setIsLoading(false); // Explicitly set false on failure here
    return false;
  };

  const signup = async (username: string, password_raw: string): Promise<boolean> => {
    setIsLoading(true);
    if (storedUsers.find(u => u.username === username)) {
      toast({ title: "Signup Failed", description: "Username already exists.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
    const passwordHash = simpleHash(password_raw);
    const newUser: User = { id: uuidv4(), username, passwordHash };
    setStoredUsers(prevUsers => [...prevUsers, newUser]);
    toast({ title: "Signup Successful", description: "You can now log in." });
    router.push('/login');
    setIsLoading(false); // Set loading false after signup logic
    return true;
  };

  const logout = () => {
    setIsLoading(true);
    setCurrentUserInternal(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    // setIsLoading(false) will be handled by the useEffect watching currentUser
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
