import { useContext, useCallback } from 'react';
import { ToastContext } from './ToastProvider.tsx';
import type { Toast, ToastVariant } from './types.ts';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, dismissToast, updateToast, toasts } = context;

  const toast = useCallback(
    (props: Omit<Toast, 'id'>) => {
      return addToast(props);
    },
    [addToast]
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({
        title,
        description,
        variant: 'success' as ToastVariant,
        duration,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({
        title,
        description,
        variant: 'error' as ToastVariant,
        duration: duration ?? 8000, // Error messages stay longer by default
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({
        title,
        description,
        variant: 'warning' as ToastVariant,
        duration,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({
        title,
        description,
        variant: 'info' as ToastVariant,
        duration,
      });
    },
    [addToast]
  );

  const promise = useCallback(
    async <T,>(
      promiseFn: Promise<T> | (() => Promise<T>),
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: Error) => string);
      }
    ): Promise<T> => {
      const id = addToast({
        title: loading,
        variant: 'info',
        duration: 0, // No auto-dismiss for loading
      });

      try {
        const data =
          promiseFn instanceof Promise ? await promiseFn : await promiseFn();

        updateToast(id, {
          title: typeof success === 'function' ? success(data) : success,
          variant: 'success',
          duration: 3000,
        });

        return data;
      } catch (err) {
        const errorMessage =
          typeof error === 'function'
            ? error(err as Error)
            : error;

        updateToast(id, {
          title: errorMessage,
          variant: 'error',
          duration: 5000,
        });

        throw err;
      }
    },
    [addToast, updateToast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    promise,
    dismiss: dismissToast,
    remove: removeToast,
    toasts,
  };
}
