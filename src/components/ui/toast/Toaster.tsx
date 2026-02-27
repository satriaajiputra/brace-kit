import { useContext } from 'react';
import { ToastContext } from './ToastProvider.tsx';
import { ToasterView } from './Toast.tsx';

interface ToasterProps {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export function Toaster({ position = 'bottom-right' }: ToasterProps) {
  const context = useContext(ToastContext);

  if (!context) {
    console.warn('Toaster must be used within a ToastProvider');
    return null;
  }

  const { toasts, dismissToast } = context;

  return <ToasterView toasts={toasts} onDismiss={dismissToast} position={position} />;
}
