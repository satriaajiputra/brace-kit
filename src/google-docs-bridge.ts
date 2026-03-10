/**
 * Google Docs Bridge — runs in the page's MAIN world at document_start.
 *
 * Sets window._docs_annotate_canvas_by_ext to a whitelisted extension ID.
 * This instructs Google Docs to activate "annotated canvas" mode, which:
 *   - Overlays an accessibility DOM layer on the canvas editor
 *   - Makes text selection available via standard Selection API on the
 *     docs-texteventtarget-iframe's contentDocument
 *   - Fires selectionchange on that iframe's document when text is selected
 *
 * The value must be a Chrome extension ID that Google has whitelisted.
 * Using an existing whitelisted ID (e.g. Grammarly's) is a common technique
 * for third-party extensions — Google only checks that the ID is in their list.
 *
 * References:
 *   https://stackoverflow.com/a/69682175
 *   https://groups.google.com/a/chromium.org/g/chromium-extensions/c/OP03CIUfews
 */

// Grammarly's whitelisted extension ID — widely used by third-party extensions
// as a stable way to enable annotated canvas mode without official whitelisting.
(window as any)._docs_annotate_canvas_by_ext = 'kbfnbcaeplbcioakkpcpgfkobkghlhen';

// Debug: confirm bridge is running
console.log('[BraceKit] Google Docs bridge injected, annotated canvas mode enabled');
