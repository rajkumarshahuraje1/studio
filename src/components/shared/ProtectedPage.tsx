
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface ProtectedPageProps {
  children: ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login, if desired
      // For now, just redirect to login
      if (pathname !== '/login' && pathname !== '/signup') {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-muted-foreground text-lg">Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback, show loading or null to prevent flashing content.
    return (
         <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p className="text-muted-foreground text-lg">Redirecting to login...</p>
         </div>
    );
  }

  // Render children if authenticated or if on public login/signup pages
  if (isAuthenticated || pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }
  
  // Fallback for scenarios where user is not authenticated and not on a public page,
  // and isLoading is false (should have been caught by useEffect redirect).
  return null; 
}
