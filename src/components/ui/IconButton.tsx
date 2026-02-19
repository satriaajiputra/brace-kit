import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md';
}

export function IconButton({
  children,
  title,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'flex items-center justify-center w-7 h-7 border-none bg-transparent text-text-muted rounded-sm cursor-pointer transition-all duration-150 hover:bg-bg-hover hover:text-text-default',
    md: 'flex items-center justify-center w-8 h-8 border-none bg-transparent text-text-muted rounded-sm cursor-pointer transition-all duration-150 hover:bg-bg-hover hover:text-text-default',
  };

  const classes = [sizeClasses[size], className].filter(Boolean).join(' ');

  return (
    <button className={classes} title={title} {...props}>
      {children}
    </button>
  );
}
