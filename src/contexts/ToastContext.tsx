'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 4000;
    const next: Toast = { id, ...toast, duration };
    setToasts((prev) => [...prev, next]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'rounded-md shadow-lg px-4 py-3 text-sm text-white max-w-sm',
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800',
            ].join(' ')}
          >
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

