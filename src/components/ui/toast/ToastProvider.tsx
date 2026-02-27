import { createContext, useCallback, useRef, useState } from 'react';
import type { Toast, ToastContextValue, ToastProviderProps } from './types.ts';

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const pausedTimersRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Clear timer
    const timerId = timersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
    pausedTimersRef.current.delete(id);

    // Remove from state
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  const startTimer = useCallback((id: string, duration: number) => {
    // Clear existing timer
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timerId = window.setTimeout(() => {
      removeToast(id);
    }, duration);

    timersRef.current.set(id, timerId);
  }, [removeToast]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = toast.duration ?? defaultDuration;

    const newToast: Toast = {
      ...toast,
      id,
      duration,
    };

    setToasts((prev) => {
      // Remove oldest if at max
      const updated = [...prev, newToast];
      if (updated.length > maxToasts) {
        const [oldest, ...rest] = updated;
        removeToast(oldest.id);
        return rest;
      }
      return updated;
    });

    // Start auto-dismiss timer
    if (duration > 0) {
      startTimer(id, duration);
    }

    return id;
  }, [defaultDuration, maxToasts, removeToast, startTimer]);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // Restart timer if duration changed
    if (updates.duration !== undefined && updates.duration > 0) {
      startTimer(id, updates.duration);
    }
  }, [startTimer]);

  const pauseToast = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      const remaining = timerId - Date.now();
      pausedTimersRef.current.set(id, remaining > 0 ? remaining : 5000);
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  }, []);

  const resumeToast = useCallback((id: string) => {
    const remaining = pausedTimersRef.current.get(id);
    if (remaining) {
      startTimer(id, remaining);
      pausedTimersRef.current.delete(id);
    }
  }, [startTimer]);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    dismissToast,
    pauseToast,
    resumeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}
