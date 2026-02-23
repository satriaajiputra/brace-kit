/**
 * Error Utilities - User-friendly error messages from API responses
 * @module background/utils/errors
 */

/**
 * Get user-friendly error messages from API responses
 * @param {Response} response - Fetch response object
 * @param {string} prefix - Error prefix (default: 'API Error')
 * @returns {Promise<string>} User-friendly error message
 */
export async function getFriendlyErrorMessage(response, prefix = 'API Error') {
  const status = response.status;
  let details = '';

  try {
    const errorText = await response.text();
    try {
      const errJson = JSON.parse(errorText);
      // Try common error pathways:
      // OpenAI/Anthropic: errJson.error.message
      // Gemini: errJson.error.message OR errJson[0].error.message
      // Generic: errJson.message
      details =
        errJson.error?.message ||
        errJson.message ||
        (typeof errJson.error === 'string' ? errJson.error : null) ||
        (Array.isArray(errJson) ? errJson[0]?.error?.message : null) ||
        errorText;
    } catch {
      details = errorText;
    }
  } catch {
    details = response.statusText;
  }

  if (!details || details.length > 500) details = response.statusText || 'Unknown error';

  let statusPrefix = `${prefix} (${status})`;
  if (status === 401) statusPrefix = 'Invalid API Key (401)';
  else if (status === 403) statusPrefix = 'Permission Denied (403)';
  else if (status === 404) statusPrefix = 'Not Found (404)';
  else if (status === 429) statusPrefix = 'Rate Limit Exceeded (429)';
  else if (status >= 500) statusPrefix = 'Provider Server Error (' + status + ')';

  return `${statusPrefix}: ${details}`;
}
