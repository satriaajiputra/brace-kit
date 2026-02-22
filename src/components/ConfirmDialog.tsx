import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      // Focus confirm button after a short delay for animation
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Restore focus when dialog closes
      previouslyFocusedRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="w-full max-w-[320px] bg-card border border-border rounded-lg shadow-2xl p-4 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-1.5">
          <h3 id="confirm-dialog-title" className="text-sm font-bold tracking-tight text-foreground uppercase">
            {title}
          </h3>
          <p id="confirm-dialog-message" className="text-xs text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            className="h-8 px-3 text-xs font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`h-8 px-4 text-xs font-bold uppercase tracking-tight rounded-sm transition-all shadow-sm active:scale-95 ${variant === 'danger'
              ? 'bg-destructive text-destructive-foreground hover:brightness-110'
              : 'bg-primary text-primary-foreground hover:brightness-110'
              }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
