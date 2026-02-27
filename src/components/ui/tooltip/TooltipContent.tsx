import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTooltip } from './TooltipProvider';
import { cn } from '../../../utils/cn';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

interface TooltipContentProps {
  children?: ReactNode;
  className?: string;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  arrowPadding?: number;
  sticky?: 'partial' | 'always' | 'never';
  hideWhenDetached?: boolean;
}

interface Position {
  top: number;
  left: number;
}

interface ArrowPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export function TooltipContent({
  children,
  className,
  side = 'top',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
}: TooltipContentProps) {
  const { isOpen, triggerRef } = useTooltip();
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [actualSide, setActualSide] = useState<Side>(side);
  const [arrowPosition, setArrowPosition] = useState<ArrowPosition>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current!.getBoundingClientRect();

      let top = 0;
      let left = 0;
      let finalSide = side;

      // Calculate position based on side
      switch (side) {
        case 'top':
          top = triggerRect.top - contentRect.height - sideOffset;
          break;
        case 'bottom':
          top = triggerRect.bottom + sideOffset;
          break;
        case 'left':
          left = triggerRect.left - contentRect.width - sideOffset;
          break;
        case 'right':
          left = triggerRect.right + sideOffset;
          break;
      }

      // Calculate alignment
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'start':
            left = triggerRect.left + alignOffset;
            break;
          case 'center':
            left =
              triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            break;
          case 'end':
            left = triggerRect.right - contentRect.width - alignOffset;
            break;
        }
      } else {
        switch (align) {
          case 'start':
            top = triggerRect.top + alignOffset;
            break;
          case 'center':
            top =
              triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            break;
          case 'end':
            top = triggerRect.bottom - contentRect.height - alignOffset;
            break;
        }
      }

      // Collision detection - flip if needed
      const padding = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check horizontal collision
      if (left < padding) {
        left = padding;
      } else if (left + contentRect.width > viewportWidth - padding) {
        left = viewportWidth - contentRect.width - padding;
      }

      // Check vertical collision and flip if needed
      if (side === 'top' && top < padding) {
        finalSide = 'bottom';
        top = triggerRect.bottom + sideOffset;
      } else if (
        side === 'bottom' &&
        top + contentRect.height > viewportHeight - padding
      ) {
        finalSide = 'top';
        top = triggerRect.top - contentRect.height - sideOffset;
      }

      // Adjust if still out of bounds after flip
      if (top < padding) {
        top = padding;
      } else if (top + contentRect.height > viewportHeight - padding) {
        top = viewportHeight - contentRect.height - padding;
      }

      // Calculate arrow position to point to trigger center
      let arrowPos: ArrowPosition = {};
      const arrowSize = 10; // w-2.5 = 10px

      if (finalSide === 'top' || finalSide === 'bottom') {
        // Arrow is on top or bottom - position horizontally
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const arrowLeft = triggerCenterX - left - arrowSize / 2;
        // Clamp arrow position within tooltip bounds (with padding)
        const minArrowPos = 6;
        const maxArrowPos = contentRect.width - arrowSize - 6;
        const clampedArrowLeft = Math.max(minArrowPos, Math.min(maxArrowPos, arrowLeft));
        arrowPos = { left: clampedArrowLeft };
      } else {
        // Arrow is on left or right - position vertically
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        const arrowTop = triggerCenterY - top - arrowSize / 2;
        // Clamp arrow position within tooltip bounds (with padding)
        const minArrowPos = 6;
        const maxArrowPos = contentRect.height - arrowSize - 6;
        const clampedArrowTop = Math.max(minArrowPos, Math.min(maxArrowPos, arrowTop));
        arrowPos = { top: clampedArrowTop };
      }

      setPosition({ top, left });
      setActualSide(finalSide);
      setArrowPosition(arrowPos);
    };

    calculatePosition();

    // Recalculate on resize and scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, triggerRef, side, sideOffset, align, alignOffset]);

  if (!isOpen) return null;

  const animationClass = {
    top: 'animate-in slide-in-from-bottom-2',
    bottom: 'animate-in slide-in-from-top-2',
    left: 'animate-in slide-in-from-right-2',
    right: 'animate-in slide-in-from-left-2',
  }[actualSide];

  const styles: CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex: 100,
    maxWidth: 'min(320px, calc(100vw - 32px))',
  };

  return createPortal(
    <div
      ref={contentRef}
      style={styles}
      className={cn(
        'pointer-events-none px-3 py-1.5',
        'bg-popover text-popover-foreground',
        'border border-border rounded-md shadow-lg',
        'text-sm font-medium',
        'transition-opacity duration-200',
        'break-words',
        animationClass,
        className
      )}
      role="tooltip"
    >
      {children}
      <TooltipArrow side={actualSide} position={arrowPosition} />
    </div>,
    document.body
  );
}

// Arrow component
interface TooltipArrowProps {
  side: Side;
  position: ArrowPosition;
}

function TooltipArrow({ side, position }: TooltipArrowProps) {
  const rotationClasses = {
    top: 'rotate-45',
    bottom: 'rotate-45',
    left: '-rotate-45',
    right: '-rotate-45',
  };

  // Border classes: sides facing OUTWARD (toward trigger) should have border
  // Arrow is a square rotated 45deg, so 2 adjacent sides form the pointing arrow
  // - top tooltip: arrow points DOWN, needs border-bottom + border-right visible
  // - bottom tooltip: arrow points UP, needs border-top + border-left visible
  // - left tooltip: arrow points RIGHT, needs border-top + border-right visible (rotated -45deg)
  // - right tooltip: arrow points LEFT, needs border-bottom + border-left visible (rotated -45deg)
  const borderClasses = {
    top: 'border-b-border border-r-border border-t-transparent border-l-transparent',
    bottom: 'border-t-border border-l-border border-b-transparent border-r-transparent',
    left: 'border-t-border border-r-border border-b-transparent border-l-transparent',
    right: 'border-b-border border-l-border border-t-transparent border-r-transparent',
  };

  const positionClasses = {
    top: 'bottom-[-5px]',
    bottom: 'top-[-5px]',
    left: 'right-[-5px]',
    right: 'left-[-5px]',
  };

  const style: CSSProperties = {};
  if (position.left !== undefined) style.left = position.left;
  if (position.top !== undefined) style.top = position.top;

  return (
    <div
      style={style}
      className={cn(
        'absolute w-2.5 h-2.5 bg-popover border',
        positionClasses[side],
        borderClasses[side],
        rotationClasses[side]
      )}
      aria-hidden="true"
    />
  );
}
