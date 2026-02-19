import type { ReactNode, ButtonHTMLAttributes } from 'react';

export type BtnVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type BtnSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
}

const variantClasses: Record<BtnVariant, string> = {
  default:
    'bg-[var(--accent-primary)] text-white border-transparent hover:opacity-90 active:opacity-80',
  destructive:
    'bg-[var(--color-danger-500)] text-white border-transparent hover:bg-[var(--color-danger-400)] active:bg-[var(--color-danger-600)]',
  outline:
    'border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]',
  secondary:
    'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:bg-[var(--bg-active)]',
  ghost:
    'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:bg-[var(--bg-active)]',
  link: 'border-transparent bg-transparent text-[var(--accent-primary)] underline-offset-4 hover:underline active:opacity-70',
};

const sizeClasses: Record<BtnSize, string> = {
  default: 'h-9 px-4 py-2 text-base',
  sm: 'h-7 px-3 py-1 text-sm',
  lg: 'h-11 px-6 py-2.5 text-base',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-7 w-7 p-0',
  'icon-lg': 'h-11 w-11 p-0',
};

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

export function Btn({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: BtnProps) {
  const classes = [base, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
