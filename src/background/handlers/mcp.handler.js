/**
 * MCP Handler - Handles MCP server lifecycle and tool calls
 * @module background/handlers/mcp
 */

import { MCPManager } from '../../../mcp.js';
import { isBuiltinTool, executeTool } from '../tools/index.js';

const mcpManager = new MCPManager();

/**
 * Handle MCP server connect
 * @param {Object} message - MCP connect message
 * @param {Function} sendResponse - Response callback
 * @returns {Promise<void>}
 */
export async function handleMCPConnect(message, sendResponse) {
  console.log('[MCPHandler] MCP_CONNECT received:', message.config);
  try {
    const result = await mcpManager.addServer(message.config);
    sendResponse(result);
  } catch (e) {
    sendResponse({ success: false, error: e.message });
  }
}

/**
 * Handle MCP server disconnect
 * @param {Object} message - MCP disconnect message
 * @param {Function} sendResponse - Response callback
 */
export function handleMCPDisconnect(message, sendResponse) {
  mcpManager.removeServer(message.serverId);
  sendResponse({ success: true });
}

/**
 * Handle MCP list tools
 * @param {Function} sendResponse - Response callback
 */
export function handleMCPListTools(sendResponse) {
  try {
    const allTools = mcpManager.getAllTools();
    console.log('[MCPHandler] MCP_LIST_TOOLS - clients:', mcpManager.clients.size, 'tools:', allTools);
    sendResponse({ tools: allTools });
  } catch (e) {
    sendResponse({ tools: [], error: e.message });
  }
}

/**
 * Handle MCP tool call
 * @param {Object} message - MCP tool call message
 * @param {Function} sendResponse - Response callback
 * @returns {Promise<void>}
 */
export async function handleMCPToolCall(message, sendResponse) {
  try {
    const { name, arguments: args } = message;

    // Check for built-in tools first
    if (isBuiltinTool(name)) {
      const { googleSearchApiKey } = await chrome.storage.local.get('googleSearchApiKey');
      const result = await executeTool(name, args, { googleSearchApiKey });
      sendResponse(result);
      return;
    }

    // MCP tool
    const found = await mcpManager.callTool(name);
    if (!found) {
      sendResponse({ error: `Tool "${name}" not found` });
      return;
    }
    const result = await found.client.callTool(name, args);
    sendResponse(result);
  } catch (e) {
    sendResponse({ error: e.message });
  }
}

/**
 * Restore MCP servers on startup
 * @returns {Promise<void>}
 */
export async function restoreMCPServers() {
  const { mcpServers } = await chrome.storage.local.get('mcpServers');
  if (mcpServers?.length > 0) {
    console.log('[MCPHandler] Restoring MCP servers:', mcpServers.length);
    for (const server of mcpServers) {
      if (server.enabled !== false) {
        try {
          await mcpManager.addServer(server);
          console.log('[MCPHandler] Restored:', server.name);
        } catch (e) {
          console.log('[MCPHandler] Failed to restore:', server.name, e);
        }
      }
    }
  }
}

/**
 * Register MCP handlers on message listener
 * @param {chrome.runtime.onMessage} onMessage - Chrome message listener
 */
export function registerMCPHandlers(onMessage) {
  onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'MCP_CONNECT':
        handleMCPConnect(message, sendResponse);
        return true;
      case 'MCP_DISCONNECT':
        handleMCPDisconnect(message, sendResponse);
        return false;
      case 'MCP_LIST_TOOLS':
        handleMCPListTools(sendResponse);
        return false;
      case 'MCP_CALL_TOOL':
        handleMCPToolCall(message, sendResponse);
        return true;
    }
    return false;
  });
}

// Export mcpManager for testing
export { mcpManager };
