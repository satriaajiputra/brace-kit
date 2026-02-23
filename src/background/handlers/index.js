/**
 * Handlers Index - Exports all message handlers
 * @module background/handlers
 */

// Chat handlers
export { handleChatRequest, handleStopStream, handleGoogleSearchToolDirect, chatService } from './chat.handler.js';

// MCP handlers
export {
  handleMCPConnect,
  handleMCPDisconnect,
  handleMCPListTools,
  handleMCPToolCall,
  restoreMCPServers,
  registerMCPHandlers,
  mcpManager
} from './mcp.handler.js';

// Memory handlers
export { handleMemoryExtract, registerMemoryHandlers } from './memory.handler.js';

// Title handlers
export { handleTitleGenerate, registerTitleHandlers } from './title.handler.js';

// Models handlers
export { handleFetchModels, registerModelsHandlers } from './models.handler.js';

// Content handlers
export { handleGetPageContent, handleGetSelectedText, registerContentHandlers } from './content.handler.js';
