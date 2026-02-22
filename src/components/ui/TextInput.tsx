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

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'prefix' | 'suffix'> {
  type?: TextInputType;
  size?: TextInputSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
}

const sizeClasses: Record<TextInputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-3.5 text-sm',
  lg: 'h-12 px-4 text-base',
};

const prefixPadding: Record<TextInputSize, string> = {
  sm: 'pl-9',
  default: 'pl-10',
  lg: 'pl-11',
};

const suffixPadding: Record<TextInputSize, string> = {
  sm: 'pr-9',
  default: 'pr-10',
  lg: 'pr-11',
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ type = 'text', size = 'default', prefix, suffix, error, className, ...props }, ref) => {
    const hasAddon = prefix != null || suffix != null;

    const inputClasses = cn(
      'w-full flex items-center rounded-lg border bg-muted/20 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 outline-none',
      'border-border/50 hover:border-border/80 focus:border-primary/50 focus:bg-muted/30 focus:ring-4 focus:ring-primary/10',
      error && 'border-destructive/50 focus:border-destructive focus:ring-destructive/10 bg-destructive/5',
      'disabled:pointer-events-none disabled:opacity-50 read-only:opacity-70 shadow-xs hover:shadow-sm',
      sizeClasses[size],
      prefix && prefixPadding[size],
      suffix && suffixPadding[size],
      !hasAddon && className
    );

    const input = (
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
    );

    if (!hasAddon) return input;

    return (
      <div className={cn('relative flex items-center w-full group', className)}>
        {prefix && (
          <span className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground/60 group-focus-within:text-primary/70 transition-colors duration-300">
            {prefix}
          </span>
        )}
        {input}
        {suffix && (
          <span className="pointer-events-none absolute right-3 flex items-center justify-center text-muted-foreground/60 group-focus-within:text-primary/70 transition-colors duration-300">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
