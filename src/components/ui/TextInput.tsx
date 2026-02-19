import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

type TextInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time'
  | 'color';

type TextInputSize = 'sm' | 'default' | 'lg';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  type?: TextInputType;
  size?: TextInputSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const sizeClasses: Record<TextInputSize, string> = {
  sm: 'h-7 px-2.5 text-sm',
  default: 'h-9 px-3 text-base',
  lg: 'h-11 px-4 text-base',
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ type = 'text', size = 'default', prefix, suffix, className, ...props }, ref) => {
    const hasAddon = prefix != null || suffix != null;

    const input = (
      <input
        ref={ref}
        type={type}
        className={cn(
          'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150 outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 disabled:pointer-events-none disabled:opacity-50 read-only:opacity-70',
          sizeClasses[size],
          prefix && 'pl-9',
          suffix && 'pr-9',
          !hasAddon && className
        )}
        {...props}
      />
    );

    if (!hasAddon) return input;

    return (
      <div className={cn('relative flex items-center', className)}>
        {prefix && (
          <span className="pointer-events-none absolute left-2.5 flex items-center text-[var(--text-muted)]">
            {prefix}
          </span>
        )}
        {input}
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 flex items-center text-[var(--text-muted)]">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
