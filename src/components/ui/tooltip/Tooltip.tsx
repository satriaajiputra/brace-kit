import type { ReactNode } from 'react';
import { TooltipProvider } from './TooltipProvider';

interface TooltipProps {
  children: ReactNode;
  defaultOpen?: boolean;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function Tooltip({
  children,
  defaultOpen = false,
  delayDuration = 200,
  skipDelayDuration = 300,
}: TooltipProps) {
  return (
    <TooltipProvider
      defaultOpen={defaultOpen}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </TooltipProvider>
  );
}
