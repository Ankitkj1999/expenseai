'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guest guard component that redirects authenticated users
 * Used for login/signup pages to prevent authenticated users from accessing them
 */
export function GuestGuard({ children, redirectTo = '/dashboard' }: GuestGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated
  if (user) {
    return null;
  }

  return <>{children}</>;
}
