/**
 * Google Docs Text Inserter
 *
 * Implements text insertion into Google Docs by simulating user input events.
 * This is necessary because Google Docs does not allow direct DOM manipulation for text input.
 *
 * Key techniques:
 * - Simulates user input via ClipboardEvent (paste) or InputEvent (beforeinput)
 * - Targets the docs-texteventtarget-iframe which receives keyboard events
 * - Uses the annotated canvas layer enabled by _docs_annotate_canvas_by_ext
 *
 */

import { logger } from './logger.ts';

// === Types ===

export interface GoogleDocsInsertResult {
  success: boolean;
  error?: string;
}

export interface GoogleDocsSelectionRange {
  start: number;
  end: number;
  fullText?: string;
}

// === Constants ===

const TEXT_EVENT_IFRAME_SELECTOR = 'iframe.docs-texteventtarget-iframe';

// === Helper Functions ===

/**
 * Check if we're on a Google Docs page
 */
export function isGoogleDocsPage(): boolean {
  return window.location.hostname === 'docs.google.com';
}

/**
 * Get the keyboard event target iframe's contentDocument
 * This is where Google Docs receives keyboard input events
 */
function getKeyboardEventTargetDoc(): Document | null {
  const iframe = document.querySelector<HTMLIFrameElement>(TEXT_EVENT_IFRAME_SELECTOR);
  return iframe?.contentDocument || null;
}

/**
 * Get the editable element inside the iframe
 */
function getEditableElement(doc: Document): HTMLElement | null {
  return doc.querySelector('[contenteditable="true"]');
}

/**
 * Create a paste event with the given text
 */
function createPasteEvent(text: string, html?: string): ClipboardEvent | null {
  try {
    // Create DataTransfer to hold clipboard data
    const dataTransfer = new DataTransfer();

    // Set plain text (required)
    dataTransfer.setData('text/plain', text);

    // Set HTML if provided (optional, for formatted text)
    if (html) {
      dataTransfer.setData('text/html', html);
    }

    // Create paste event
    const event = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });

    return event;
  } catch (error) {
    logger.error('[BraceKit] Failed to create paste event:', error);
    return null;
  }
}

/**
 * Create a beforeinput event with insertReplacementText type
 * Alternative method for text insertion
 */
function createBeforeInputEvent(text: string, html?: string): InputEvent | null {
  try {
    let dataTransfer: DataTransfer | undefined;

    if (html) {
      dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', text);
      dataTransfer.setData('text/html', html);
    }

    const event = new InputEvent('beforeinput', {
      inputType: 'insertReplacementText',
      data: text,
      dataTransfer,
      cancelable: true,
      bubbles: true,
    });

    return event;
  } catch (error) {
    logger.error('[BraceKit] Failed to create beforeinput event:', error);
    return null;
  }
}

/**
 * Type text character by character via keyboard events
 * Fallback method when paste doesn't work
 */
function typeTextCharacterByCharacter(doc: Document, text: string): boolean {
  const editable = getEditableElement(doc);
  if (!editable) return false;

  for (const char of text) {
    const keyCode = char.charCodeAt(0);
    const upperChar = char.toUpperCase();

    const event = new KeyboardEvent('keypress', {
      altKey: false,
      bubbles: true,
      charCode: 0,
      code: `Key${upperChar}`,
      composed: true,
      key: char,
      ctrlKey: false,
      keyCode: keyCode,
      shiftKey: upperChar === char,
      which: keyCode,
      isComposing: false,
      repeat: false,
      metaKey: false,
    });

    doc.dispatchEvent(event);
  }

  return true;
}

/**
 * Delete current selection via keyboard event
 */
function dispatchDeleteEvent(target: EventTarget): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 46, // Delete key
      key: 'Delete',
      code: 'Delete',
    })
  );
}

/**
 * Dispatch arrow key events to force selection update
 * This helps when Google Docs' internal selection state is stale
 */
function dispatchArrowEvents(target: EventTarget): void {
  // ArrowRight to move cursor
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 39,
      key: 'ArrowRight',
      code: 'ArrowRight',
    })
  );
}

/**
 * Set selection range in the editable element
 * This is critical for replacing text at the correct position
 */
function setSelectionRange(
  editableEl: HTMLElement,
  doc: Document,
  start: number,
  end: number
): boolean {
  const selection = doc.getSelection();
  if (!selection) return false;

  const range = doc.createRange();
  const textNodes: Text[] = [];

  // Collect all text nodes
  const walker = doc.createTreeWalker(editableEl, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }

  // Find start and end positions
  let currentPos = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (const textNode of textNodes) {
    const nodeLength = textNode.length;

    if (!startNode && currentPos + nodeLength > start) {
      startNode = textNode;
      startOffset = start - currentPos;
    }

    if (!endNode && currentPos + nodeLength >= end) {
      endNode = textNode;
      endOffset = end - currentPos;
    }

    currentPos += nodeLength;

    if (startNode && endNode) break;
  }

  if (!startNode || !endNode) {
    logger.warn('[BraceKit] Could not find text nodes for selection range');
    return false;
  }

  try {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  } catch (error) {
    logger.error('[BraceKit] Failed to set selection range:', error);
    return false;
  }
}

/**
 * Force selection using keyboard events (Grammarly technique)
 * Used when setSelectionRange fails
 */
function forceSelectionWithKeyboard(target: EventTarget): boolean {
  // Dispatch Shift+ArrowRight to create a selection
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 39,
      key: 'ArrowRight',
      code: 'ArrowRight',
      shiftKey: true,
    })
  );

  // Then dispatch ArrowLeft to collapse and position
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 37,
      key: 'ArrowLeft',
      code: 'ArrowLeft',
    })
  );

  return true;
}

// === Main Insert Function ===

/**
 * Insert text into Google Docs
 *
 * This function attempts to insert text using multiple methods:
 * 1. Paste event (primary) - simulates Ctrl+V paste
 * 2. Beforeinput event (fallback) - modern input API
 * 3. Character-by-character typing (last resort)
 *
 * @param text - The text to insert
 * @param html - Optional HTML for formatted insertion
 * @returns Result indicating success or failure
 */
export function insertTextToGoogleDocs(text: string, html?: string): GoogleDocsInsertResult {

  // Get the keyboard event target
  const frameDoc = getKeyboardEventTargetDoc();
  if (!frameDoc) {
    logger.error('[BraceKit] Could not access Google Docs iframe');
    return { success: false, error: 'Could not access Google Docs iframe' };
  }

  const editableElement = getEditableElement(frameDoc);
  if (!editableElement) {
    logger.error('[BraceKit] Could not find editable element in Google Docs iframe');
    return { success: false, error: 'Could not find editable element' };
  }

  // Focus the editable element
  editableElement.focus();

  // Method 1: Try paste event
  const pasteEvent = createPasteEvent(text, html);
  if (pasteEvent) {
    const dispatched = editableElement.dispatchEvent(pasteEvent);

    if (dispatched && !pasteEvent.defaultPrevented) {
      dispatchArrowEvents(editableElement);
      return { success: true };
    }

  }

  // Method 2: Try beforeinput event (modern alternative)
  const beforeInputEvent = createBeforeInputEvent(text, html);
  if (beforeInputEvent) {
    const dispatched = editableElement.dispatchEvent(beforeInputEvent);

    if (dispatched && !beforeInputEvent.defaultPrevented) {
      dispatchArrowEvents(editableElement);
      return { success: true };
    }

  }

  // Method 3: Character-by-character typing (last resort, slower)
  if (typeTextCharacterByCharacter(frameDoc, text)) {
    return { success: true };
  }

  return { success: false, error: 'All insertion methods failed' };
}

/**
 * Replace selected text in Google Docs
 *
 * @param newText - The new text to replace the selection with
 * @param selectionRange - Optional saved selection range {start, end} to restore
 * @param html - Optional HTML for formatted replacement
 * @returns Result indicating success or failure
 */
export function replaceTextInGoogleDocs(
  newText: string,
  selectionRange?: { start: number; end: number },
  html?: string
): GoogleDocsInsertResult {
  const frameDoc = getKeyboardEventTargetDoc();
  if (!frameDoc) {
    return { success: false, error: 'Could not access Google Docs iframe' };
  }

  const editableElement = getEditableElement(frameDoc);
  if (!editableElement) {
    return { success: false, error: 'Could not find editable element' };
  }

  // Focus the editable element
  editableElement.focus();

  // If we have a saved selection range, restore it
  if (selectionRange) {
    const selectionSet = setSelectionRange(
      editableElement,
      frameDoc,
      selectionRange.start,
      selectionRange.end
    );

    if (!selectionSet) {
      // Fallback: try to force selection with keyboard events
      forceSelectionWithKeyboard(editableElement);
    }
  } else {
    // Check if there's a current selection to replace
    const selection = frameDoc.getSelection();
    const hasSelection = selection && selection.toString().trim().length > 0;

    if (hasSelection) {
    } else {
    }
  }

  // Delete current selection first (if any)
  dispatchDeleteEvent(editableElement);

  // Now insert the new text
  return insertTextToGoogleDocs(newText, html);
}

/**
 * Check if Google Docs is ready for text insertion
 */
export function isGoogleDocsReady(): boolean {
  const frameDoc = getKeyboardEventTargetDoc();
  if (!frameDoc) return false;

  const editable = getEditableElement(frameDoc);
  return editable !== null;
}
