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
    'bg-primary text-primary-foreground border-transparent hover:brightness-110 active:scale-95 shadow-sm',
  destructive:
    'bg-destructive text-destructive-foreground border-transparent hover:brightness-110 active:scale-95 shadow-sm',
  outline:
    'border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
  secondary:
    'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 active:bg-secondary/60',
  ghost:
    'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80',
  link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:underline active:opacity-70',
};

const sizeClasses: Record<BtnSize, string> = {
  default: 'h-9 px-4 py-2 text-sm',
  sm: 'h-8 px-3 py-1.5 text-xs font-semibold uppercase tracking-tight',
  lg: 'h-11 px-6 py-2.5 text-base',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-7 w-7 p-0',
  'icon-lg': 'h-11 w-11 p-0',
};

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 disabled:grayscale [&_svg]:pointer-events-none [&_svg]:shrink-0';

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
