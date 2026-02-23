/**
 * Background Service Worker Entry Point
 * Main entry for Chrome extension background script
 * @module background
 */

import { handleChatRequest, handleStopStream, handleGoogleSearchToolDirect } from './handlers/chat.handler.js';
import { restoreMCPServers, registerMCPHandlers } from './handlers/mcp.handler.js';
import { registerMemoryHandlers } from './handlers/memory.handler.js';
import { registerTitleHandlers } from './handlers/title.handler.js';
import { registerModelsHandlers } from './handlers/models.handler.js';
import { registerContentHandlers } from './handlers/content.handler.js';
import { migrateOldConversations } from '../utils/conversationDB.ts';

// Initialize MCP servers on startup
restoreMCPServers();

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Set side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  }

  // Handle data migrations
  if (details.reason === 'install' || details.reason === 'update') {
    migrateOldConversations().catch(e => console.error('[Background] Migration error:', e));
  }

  // Create context menu
  chrome.contextMenus.create({
    id: 'send-to-ai-sidebar',
    title: 'Send to BraceKit',
    contexts: ['selection'],
  });
});

// Context menu handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'send-to-ai-sidebar') {
    // Open sidebar and send selection
    chrome.sidePanel.open({ tabId: tab.id });

    // Small delay to let sidebar load
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'CONTEXT_MENU_SELECTION',
        data: {
          selectedText: info.selectionText,
          pageTitle: tab.title,
          pageUrl: tab.url,
        },
      });
    }, 500);
  }
});

// Main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CHAT_REQUEST':
      handleChatRequest(message, sendResponse);
      return true; // async

    case 'STOP_STREAM':
      handleStopStream(message, sendResponse);
      return false;

    case 'GOOGLE_SEARCH_TOOL':
      handleGoogleSearchToolDirect(message, sendResponse);
      return true;

    case 'TEXT_SELECTED':
      // Relay text selection from content script to sidebar
      chrome.runtime.sendMessage({
        type: 'SELECTION_UPDATED',
        data: message.data,
      });
      return false;

    default:
      // Let other handlers process
      return false;
  }
});

// Register domain-specific handlers
registerMCPHandlers(chrome.runtime.onMessage);
registerMemoryHandlers(chrome.runtime.onMessage);
registerTitleHandlers(chrome.runtime.onMessage);
registerModelsHandlers(chrome.runtime.onMessage);
registerContentHandlers(chrome.runtime.onMessage);
