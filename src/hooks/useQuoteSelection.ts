import { useCallback, useState, useEffect } from 'react';
import { useStore } from '../store';
import { turndownService } from '../utils/turndown';

export interface QuotePopupState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

/**
 * Hook for handling text selection and quote popup functionality.
 * Used in MessageBubble and StreamingBubble for quoting AI responses.
 *
 * @param containerRef - Ref to the container element to detect selections within
 * @returns Quote popup state and handlers
 */
export function useQuoteSelection(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [quotePopup, setQuotePopup] = useState<QuotePopupState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });

  const setQuotedText = useStore((state) => state.setQuotedText);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setQuotePopup((p) => ({ ...p, visible: false }));
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setQuotePopup((p) => ({ ...p, visible: false }));
      return;
    }

    const ref = containerRef.current;
    if (!ref) return;
    const range = selection.getRangeAt(0);
    if (!ref.contains(range.commonAncestorContainer)) {
      setQuotePopup((p) => ({ ...p, visible: false }));
      return;
    }

    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    const markdown = turndownService.turndown(container.innerHTML).trim();

    const rect = range.getBoundingClientRect();
    const bubbleRect = ref.getBoundingClientRect();

    setQuotePopup({
      visible: true,
      x: rect.left + rect.width / 2 - bubbleRect.left,
      y: rect.top - bubbleRect.top - 4,
      text: markdown,
    });
  }, [containerRef]);

  const handleQuoteClick = useCallback(() => {
    if (quotePopup.text) {
      setQuotedText(quotePopup.text);
      window.getSelection()?.removeAllRanges();
      setQuotePopup((p) => ({ ...p, visible: false }));
    }
  }, [quotePopup.text, setQuotedText]);

  // Global mousedown handler for quote popup
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const ref = containerRef.current;
      if (ref && !ref.contains(e.target as Node)) {
        setQuotePopup((p) => ({ ...p, visible: false }));
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => document.removeEventListener('mousedown', handleGlobalMouseDown);
  }, [containerRef]);

  return {
    quotePopup,
    handleMouseUp,
    handleQuoteClick,
  };
}
