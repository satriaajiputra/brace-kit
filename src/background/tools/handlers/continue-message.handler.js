/**
 * Continue Message Tool Handler
 * Returns a response indicating the chain message has been initiated
 */

/**
 * Handle continue_message tool execution
 * @returns {Promise<Object>} Tool result
 */
export async function handleContinueMessage() {
  return {
    content: [{ text: 'Chain message initiated. You may continue your response now.' }],
  };
}
