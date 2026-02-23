/**
 * Tool Registry - Single Source of Truth for all built-in tools
 * Provides tool definitions and handlers for the background service worker
 */

import { GOOGLE_SEARCH_TOOL } from './definitions/google-search.tool.js';
import { CONTINUE_MESSAGE_TOOL } from './definitions/continue-message.tool.js';
import { handleGoogleSearch } from './handlers/google-search.handler.js';
import { handleContinueMessage } from './handlers/continue-message.handler.js';

// Tool definitions map
const TOOL_DEFINITIONS = {
  google_search: GOOGLE_SEARCH_TOOL,
  continue_message: CONTINUE_MESSAGE_TOOL,
};

// Tool handlers map
const TOOL_HANDLERS = {
  google_search: handleGoogleSearch,
  continue_message: handleContinueMessage,
};

/**
 * Get tool definitions for API requests
 * @param {Object} options - Filter options
 * @param {boolean} options.includeGoogleSearch - Include google_search tool
 * @param {boolean} options.includeContinueMessage - Include continue_message tool
 * @returns {Array} Array of tool definitions
 */
export function getToolDefinitions(options = {}) {
  const tools = [];

  if (options.includeGoogleSearch) {
    tools.push(GOOGLE_SEARCH_TOOL);
  }
  if (options.includeContinueMessage) {
    tools.push(CONTINUE_MESSAGE_TOOL);
  }

  return tools;
}

/**
 * Check if a tool name is a built-in tool
 * @param {string} name - Tool name to check
 * @returns {boolean} True if the tool is a built-in tool
 */
export function isBuiltinTool(name) {
  return name in TOOL_HANDLERS;
}

/**
 * Execute a built-in tool
 * @param {string} name - Tool name to execute
 * @param {Object} args - Tool arguments
 * @param {Object} context - Execution context (e.g., API keys)
 * @returns {Promise<Object>} Tool execution result
 * @throws {Error} If tool is not found
 */
export async function executeTool(name, args, context) {
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return handler(args, context);
}

/**
 * Get all built-in tool names
 * @returns {string[]} Array of built-in tool names
 */
export function getBuiltinToolNames() {
  return Object.keys(TOOL_DEFINITIONS);
}

/**
 * Get a specific tool definition by name
 * @param {string} name - Tool name
 * @returns {Object|undefined} Tool definition or undefined if not found
 */
export function getToolDefinition(name) {
  return TOOL_DEFINITIONS[name];
}

// Re-export tool definitions for direct access
export { GOOGLE_SEARCH_TOOL, CONTINUE_MESSAGE_TOOL };
