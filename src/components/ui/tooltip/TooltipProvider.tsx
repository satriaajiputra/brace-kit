import type { ReactNode } from 'react';
import { useState, useCallback, createContext, useContext } from 'react';

interface TooltipContextValue {
  isOpen: boolean;
  openTooltip: () => void;
  closeTooltip: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  content?: string;
  setContent: (content: string) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

interface TooltipProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function TooltipProvider({
  children,
  defaultOpen = false,
}: TooltipProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [content, setContent] = useState('');
  const triggerRef = useState<React.RefObject<HTMLElement | null>>({
    current: null,
  })[0];

  const openTooltip = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTooltip = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <TooltipContext.Provider
      value={{
        isOpen,
        openTooltip,
        closeTooltip,
        triggerRef,
        content,
        setContent,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}
