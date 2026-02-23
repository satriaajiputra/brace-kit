/**
 * Content Handler - Handles GET_PAGE_CONTENT and GET_SELECTED_TEXT messages
 * @module background/handlers/content
 */

/**
 * Forward message to content script
 * @param {Object} message - Message to forward
 * @param {Function} sendResponse - Response callback
 * @returns {Promise<void>}
 */
async function forwardToContentScript(message, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      sendResponse({ error: 'No active tab' });
      return;
    }
    const response = await chrome.tabs.sendMessage(tab.id, message);
    sendResponse(response);
  } catch (e) {
    sendResponse({ error: e.message });
  }
}

/**
 * Handle get page content message
 * @param {Object} message - Get page content message
 * @param {Function} sendResponse - Response callback
 * @returns {Promise<void>}
 */
export async function handleGetPageContent(message, sendResponse) {
  await forwardToContentScript(message, sendResponse);
}

/**
 * Handle get selected text message
 * @param {Object} message - Get selected text message
 * @param {Function} sendResponse - Response callback
 * @returns {Promise<void>}
 */
export async function handleGetSelectedText(message, sendResponse) {
  await forwardToContentScript(message, sendResponse);
}

/**
 * Register content handlers on message listener
 * @param {chrome.runtime.onMessage} onMessage - Chrome message listener
 */
export function registerContentHandlers(onMessage) {
  onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_CONTENT':
      case 'GET_SELECTED_TEXT':
        forwardToContentScript(message, sendResponse);
        return true;
    }
    return false;
  });
}
