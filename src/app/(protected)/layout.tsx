'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Loading from '@/components/common/Loading';
import React from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <React.Suspense fallback={<Loading /> }>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
