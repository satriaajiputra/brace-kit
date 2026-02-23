/**
 * Chat Handler - Handles CHAT_REQUEST and STOP_STREAM messages
 * @module background/handlers/chat
 */

import { createChatService } from '../services/chat.service.js';

const chatService = createChatService();

/**
 * Handle chat request message
 * @param {Object} message - Chat request message
 * @param {Function} sendResponse - Response callback
 * @returns {boolean} True for async response
 */
export function handleChatRequest(message, sendResponse) {
  chatService.executeRequest(message, sendResponse);
  return true; // async response
}

/**
 * Handle stop stream message
 * @param {Object} message - Stop stream message
 * @param {Function} sendResponse - Response callback
 * @returns {boolean} False for sync response
 */
export function handleStopStream(message, sendResponse) {
  const success = chatService.abortRequest(message.requestId);
  sendResponse({ success });
  return false;
}

/**
 * Handle direct Google Search tool call
 * @param {Object} message - Google search message
 * @param {Function} sendResponse - Response callback
 * @returns {boolean} True for async response
 */
export async function handleGoogleSearchToolDirect(message, sendResponse) {
  try {
    const { executeTool } = await import('../tools/index.js');
    const { arguments: args } = message;
    const { googleSearchApiKey } = await chrome.storage.local.get('googleSearchApiKey');
    const result = await executeTool('google_search', args, { googleSearchApiKey });
    sendResponse(result);
  } catch (e) {
    sendResponse({ content: [{ text: `Google Search Error: ${e.message}` }] });
  }
  return true;
}

// Export chatService for testing
export { chatService };
