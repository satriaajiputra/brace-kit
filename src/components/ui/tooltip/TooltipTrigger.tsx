import type { ReactNode, HTMLAttributes } from 'react';
import { useRef, useEffect } from 'react';
import { useTooltip } from './TooltipProvider';

export interface TooltipTriggerProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function TooltipTrigger({
  children,
  ...props
}: TooltipTriggerProps) {
  const { openTooltip, closeTooltip, triggerRef } = useTooltip();
  const localRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (localRef.current) {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
        localRef.current;
    }
  }, [triggerRef]);

  const handleMouseEnter = () => {
    openTooltip();
  };

  const handleMouseLeave = () => {
    closeTooltip();
  };

  const handleFocus = () => {
    openTooltip();
  };

  const handleBlur = () => {
    closeTooltip();
  };

  return (
    <span
      ref={localRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-flex"
      {...props}
    >
      {children}
    </span>
  );
}
