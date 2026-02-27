import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
} from 'lucide-react';
import type { Toast as ToastType } from './types.ts';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const variantConfig = {
  default: {
    icon: InfoIcon,
    className:
      'bg-card border-border text-foreground',
    iconClassName: 'text-primary',
  },
  success: {
    icon: CheckCircleIcon,
    className:
      'bg-card border-success/30 text-foreground',
    iconClassName: 'text-success',
  },
  error: {
    icon: XCircleIcon,
    className:
      'bg-card border-destructive/30 text-foreground',
    iconClassName: 'text-destructive',
  },
  warning: {
    icon: AlertTriangleIcon,
    className:
      'bg-card border-warning/30 text-foreground',
    iconClassName: 'text-warning',
  },
  info: {
    icon: InfoIcon,
    className:
      'bg-card border-primary/30 text-foreground',
    iconClassName: 'text-primary',
  },
};

export function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const variant = toast.variant ?? 'default';
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(enterTimer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    // Wait for exit animation
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  return (
    <div
      className={[
        'pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-lg border shadow-lg transition-all duration-300',
        config.className,
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
      ].join(' ')}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => {
        // Optional: pause timer on hover
      }}
      onMouseLeave={() => {
        // Optional: resume timer on leave
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={['h-5 w-5', config.iconClassName].join(' ')} />
        </div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-sm leading-5">{toast.title}</h4>
          )}
          {toast.description && (
            <p className="mt-1 text-sm text-muted-foreground leading-5">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close toast"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-muted/50 overflow-hidden">
          <div
            className={[
              'h-full transition-all ease-linear',
              variant === 'success' && 'bg-success',
              variant === 'error' && 'bg-destructive',
              variant === 'warning' && 'bg-warning',
              variant === 'info' && 'bg-primary',
              variant === 'default' && 'bg-primary',
              isVisible && !isLeaving ? 'w-full' : 'w-0',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              transitionDuration: isVisible && !isLeaving ? `${toast.duration}ms` : '300ms',
            }}
          />
        </div>
      )}
    </div>
  );
}

interface ToasterViewProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

const positionClasses = {
  'top-left': 'top-0 left-0',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-0 right-0',
};

export function ToasterView({
  toasts,
  onDismiss,
  position = 'bottom-right',
}: ToasterViewProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={[
        'fixed z-[9999] flex flex-col gap-2 p-4 pointer-events-none',
        positionClasses[position],
        position.startsWith('top') ? 'flex-col-reverse' : 'flex-col',
      ].join(' ')}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}
