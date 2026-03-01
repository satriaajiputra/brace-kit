import { memo, useRef, useCallback, useState, useEffect, useMemo } from 'react';
import TurndownService from 'turndown';
import { RefreshCwIcon, QuoteIcon } from 'lucide-react';
import { useStore } from '../../store';
import { renderMarkdown } from '../../utils/markdown';
import { useMermaidHydration } from '../../hooks/useMermaidHydration';
import { ReasoningSection } from './sections/ReasoningSection';
import { GEMINI_NO_TOOLS_MODELS, GEMINI_SEARCH_ONLY_MODELS, XAI_IMAGE_MODELS } from '../../providers';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// Remove citation superscripts from converted markdown
turndownService.addRule('citations', {
  filter: (node) => {
    return node.nodeName === 'SUP' && node.querySelector('a.citation-link') !== null;
  },
  replacement: () => '',
});

/**
 * Custom hook for streaming content with optimized store subscriptions.
 * Only re-renders when streaming-related state changes.
 */
function useStreamingContent() {
  // Individual selectors for optimal memoization
  const streamingContent = useStore((state) => state.streamingContent);
  const streamingReasoningContent = useStore((state) => state.streamingReasoningContent);
  const currentModel = useStore((state) => state.providerConfig.model || '');
  const currentProviderId = useStore((state) => state.providerConfig.providerId || '');

  // Memoize the image generation model check
  const isImageGenerationModel = useMemo(
    () =>
      GEMINI_NO_TOOLS_MODELS.includes(currentModel) ||
      GEMINI_SEARCH_ONLY_MODELS.includes(currentModel) ||
      (currentProviderId === 'xai' && XAI_IMAGE_MODELS.includes(currentModel)),
    [currentModel, currentProviderId]
  );

  return {
    streamingContent,
    streamingReasoningContent,
    isImageGenerationModel,
  };
}

interface QuotePopupState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

/**
 * StreamingBubble - Optimized component for displaying streaming AI responses.
 *
 * This component manages its own store subscriptions to prevent unnecessary
 * re-renders in parent components (MessageList) and sibling MessageBubble instances.
 *
 * Features:
 * - Isolated store subscriptions via useStreamingContent hook
 * - Quote selection support
 * - Reasoning content display
 * - Image generation loading indicator
 */
function StreamingBubbleInternal() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [quotePopup, setQuotePopup] = useState<QuotePopupState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });

  // Use custom hook for streaming state - isolated subscriptions
  const { streamingContent, streamingReasoningContent, isImageGenerationModel } = useStreamingContent();

  // Quote text setter from store (stable selector)
  const setQuotedText = useStore((state) => state.setQuotedText);

  // Use mermaid hydration (disabled during streaming)
  useMermaidHydration(bubbleRef, { isStreaming: true });

  const hasContent = streamingContent.length > 0;

  // Quote handling
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

    const ref = bubbleRef.current;
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
  }, []);

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
      const ref = bubbleRef.current;
      if (ref && !ref.contains(e.target as Node)) {
        setQuotePopup((p) => ({ ...p, visible: false }));
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => document.removeEventListener('mousedown', handleGlobalMouseDown);
  }, []);

  return (
    <div className="group flex flex-col gap-1 max-w-[92%] self-start" data-streaming-bubble="true">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1.5">
        AI
      </div>
      <div
        className="prose dark:prose-invert prose-sm prose-p:my-2 prose-hr:my-4 max-w-none relative break-words px-3.5 py-1.5 pb-2.5 bg-muted/40 border border-border rounded-lg rounded-bl-sm"
        ref={bubbleRef}
        onMouseUp={handleMouseUp}
      >
        {/* Reasoning section (for thinking models) */}
        {streamingReasoningContent && (
          <ReasoningSection content={streamingReasoningContent} isStreaming={true} />
        )}

        {/* Main content */}
        {hasContent ? (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(streamingContent, true),
            }}
          />
        ) : (
          <div className="flex gap-1 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
          </div>
        )}

        {/* Image generation indicator */}
        {isImageGenerationModel && (
          <div className="mt-2 h-40 w-full rounded-md bg-muted/30 animate-pulse flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="text-xs font-medium text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCwIcon size={16} className="animate-spin text-primary/60" />
              Generating image...
            </div>
          </div>
        )}

        {/* Quote popup */}
        {quotePopup.visible && (
          <div
            className="absolute z-10 flex items-center bg-popover/95 backdrop-blur-md border border-border rounded-md shadow-xl p-0.5 animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: quotePopup.x,
              top: quotePopup.y,
              transform: 'translate(-50%, -100%)',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm transition-all"
              onClick={handleQuoteClick}
              title="Quote"
            >
              <div className="flex items-center justify-center">
                <QuoteIcon size={14} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export memoized component with display name for DevTools
export const StreamingBubble = memo(StreamingBubbleInternal);
StreamingBubble.displayName = 'StreamingBubble';
