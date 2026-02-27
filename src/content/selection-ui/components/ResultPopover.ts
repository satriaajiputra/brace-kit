/**
 * Result Popover component for selection-ui
 * Creates and manages the result popover using lit-html
 */

import { render } from 'lit-html';
import type { QuickAction, SelectionPosition } from '../types.ts';
import { popoverTemplate, overlayTemplate, type PopoverState, type PopoverCallbacks } from '../templates/index.ts';

// === Types ===

export interface ResultPopoverConfig {
  position: SelectionPosition;
  action: QuickAction['id'];
  isEditable: boolean;
  onRegenerate: () => void;
  onCopy: () => void;
  onApply: () => void;
  onClose: () => void;
}

export interface ResultPopoverAPI {
  element: HTMLElement;
  setContent: (content: string) => void;
  getContent: () => string;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  destroy: () => void;
}

// === Factory Function ===

/**
 * Create and render the result popover using lit-html
 */
export function createResultPopover(
  shadow: ShadowRoot,
  config: ResultPopoverConfig
): ResultPopoverAPI {
  const { position, action, isEditable, onRegenerate, onCopy, onApply, onClose } = config;

  // Create containers
  const overlayContainer = document.createElement('div');
  overlayContainer.className = 'bk-popover-overlay-container';
  shadow.appendChild(overlayContainer);

  const popoverContainer = document.createElement('div');
  popoverContainer.className = 'bk-popover-container';
  shadow.appendChild(popoverContainer);

  // State
  let state: PopoverState = {
    action,
    position,
    isEditable,
    viewState: { type: 'loading' },
    copyButtonText: 'Copy',
    isCopied: false,
  };

  // Store current content
  let currentContent = '';

  // Render function
  function renderPopover() {
    render(popoverTemplate(state, callbacks), popoverContainer);
  }

  // Render overlay
  function renderOverlay() {
    render(overlayTemplate(handleOverlayClick), overlayContainer);
  }

  // Callbacks
  const callbacks: PopoverCallbacks = {
    onClose: () => {
      destroy();
      onClose();
    },

    onRegenerate: () => {
      onRegenerate();
    },

    onCopy: async () => {
      await onCopy();
      // Update button state temporarily
      state = { ...state, copyButtonText: 'Copied', isCopied: true };
      renderPopover();
      setTimeout(() => {
        state = { ...state, copyButtonText: 'Copy', isCopied: false };
        renderPopover();
      }, 2000);
    },

    onApply: () => {
      onApply();
    },
  };

  // Overlay click handler
  const handleOverlayClick = (e: Event) => {
    // Only close if clicking on overlay itself
    if (e.target === overlayContainer.firstElementChild) {
      destroy();
      onClose();
    }
  };

  // Escape key handler
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      destroy();
      onClose();
    }
  };

  // Destroy function
  function destroy() {
    document.removeEventListener('keydown', handleEscape);
    if (overlayContainer.parentNode) {
      overlayContainer.remove();
    }
    if (popoverContainer.parentNode) {
      popoverContainer.remove();
    }
  }

  // Attach escape listener
  document.addEventListener('keydown', handleEscape);

  // Initial render
  renderOverlay();
  renderPopover();

  return {
    element: popoverContainer,
    setContent: (content: string) => {
      currentContent = content;
      state = {
        ...state,
        viewState: { type: 'content', content },
        isCopied: false,
        copyButtonText: 'Copy',
      };
      renderPopover();
    },
    getContent: () => currentContent,
    setLoading: (isLoading: boolean) => {
      if (isLoading) {
        currentContent = '';
        state = {
          ...state,
          viewState: { type: 'loading' },
          isCopied: false,
          copyButtonText: 'Copy',
        };
      }
      // When setting loading to false without content, keep previous state
      // This is handled by setContent or setError
      renderPopover();
    },
    setError: (error: string) => {
      currentContent = '';
      state = {
        ...state,
        viewState: { type: 'error', message: error },
        isCopied: false,
        copyButtonText: 'Copy',
      };
      renderPopover();
    },
    destroy,
  };
}
