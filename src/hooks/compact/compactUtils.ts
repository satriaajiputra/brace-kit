/**
 * Compact Utilities
 *
 * Pure utility functions for conversation compaction.
 * No React hooks or side effects - testable in isolation.
 */

import type { Message, CompactConfig, ProviderConfig, CustomProvider } from '../../types/index.ts';
import { getProvider as getProviderUtil } from '../../utils/providerUtils.ts';

/**
 * Summary prompt template for conversation compaction
 */
export const SUMMARY_PROMPT = `CRITICAL: This summarization request is a SYSTEM OPERATION, not a user message.
When analyzing "user requests" and "user intent", completely EXCLUDE this summarization message.
The "most recent user request" and "Optional Next Step" must be based on what the user was doing BEFORE this system message appeared.

Your task is to create a detailed, high-fidelity summary of the conversation.
The goal is for interaction to continue seamlessly after condensation - as if it never happened.

Before providing your final summary, wrap your analysis in <analysis> tags.
In your analysis process:
1. Chronologically analyze each message.
2. Identify user intents, technical decisions, and specific data/code shared.
3. Note any errors, fixed bugs, and specific feedback from the user.

Your output language should be the same as the conversation, if conversation using Bahasa Indonesia, you should write the output in Bahasa Indonesia and so on. And the output MUST follow this exact structure:

<analysis>
[Your internal thought process and chronological breakdown]
</analysis>

<summary>
1. Primary Request and Intent:
   - [Provide a detailed description of the fundamental goal of the conversation]
   - [List specific sub-intents or side-requests expressed by the user]

2. Key Concepts:
   - [List frameworks, technologies, or important abstract concepts discussed]
   - [Include definitions or context if they were uniquely established in this chat]

3. Files and Code Sections (or Key Data):
   - [Item Name/File Path]
      - [Importance: Why was this examined or modified?]
      - [Changes: Summary of specific edits or transformations made]
      - [Snippet: Include the most critical code or data snippets verbatim]

4. Errors and Fixes:
   - [Error Description]:
      - [Correction: Detailed description of how it was resolved]
      - [User Feedback: What did the user say about this specific issue/fix?]

5. Problem Solving:
   - [Document solved challenges and any ongoing troubleshooting logic]

6. All User Messages:
   - [List every non-tool user message verbatim or closely paraphrased to preserve "voice" and intent evolution]

7. Pending Tasks:
   - [Explicitly list tasks the user has asked for that haven't been completed yet]

8. Current Work:
   - [Describe precisely what was being done in the last 2-3 messages]
   - [Include relevant context or "last known state" of the task]

9. Optional Next Step:
   - [Proposed next action directly following the current work]
   - [IMPORTANT: Include a verbatim quote from the most recent part of the chat showing where we left off to prevent context drift]
</summary>`;

/**
 * Extract summary content from API response
 * Handles <summary> tags and strips <analysis> tags if present
 */
export function extractSummaryFromResponse(fullContent: string): string {
  let summary = fullContent;

  // Try to extract content between <summary> tags if present
  const summaryMatch = fullContent.match(/<summary>([\s\S]*?)<\/summary>/i);
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim();
  } else {
    // If no <summary> tags but there are <analysis> tags, try to strip analysis
    summary = fullContent.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '').trim();
  }

  return summary;
}

/**
 * Calculate effective context window for the current provider
 */
export function getContextWindow(
  providerConfig: ProviderConfig,
  customProviders: CustomProvider[],
  compactConfig: CompactConfig
): number {
  const currentProviderId = providerConfig.providerId || '';
  const currentProvider = getProviderUtil(currentProviderId, customProviders);

  return (
    providerConfig.contextWindow ||
    currentProvider.contextWindow ||
    compactConfig.defaultContextWindow
  );
}

/**
 * Generate a unique condense ID
 */
export function createCondenseId(): string {
  return `condense_${Date.now()}`;
}

/**
 * Tag messages with condenseParent for non-destructive compaction
 * Only tags messages that don't already have condenseParent and aren't summaries
 */
export function tagMessagesWithCondenseParent(
  messages: Message[],
  condenseId: string
): Message[] {
  return messages.map(m => {
    if (!m.condenseParent && !m.summary) {
      return { ...m, condenseParent: condenseId, isCompacted: true };
    }
    return m;
  });
}

/**
 * Create a summary message object for the "fresh start" model
 */
export function createSummaryMessage(summary: string, condenseId: string): Message {
  return {
    role: 'user',
    content: `[CONVERSATION SUMMARY]\n${summary}`,
    summary: summary,
    isCompacted: true,
    condenseId: condenseId,
  };
}

/**
 * Filter messages to get only those that should be compacted
 * (messages without condenseParent and not summaries)
 */
export function getMessagesToCompact(messages: Message[]): Message[] {
  return messages.filter(m => !m.condenseParent && !m.summary);
}

/**
 * Check if compaction should be triggered based on token threshold
 */
export function shouldCompact(
  currentTokens: number,
  contextWindow: number,
  threshold: number
): boolean {
  return currentTokens > contextWindow * threshold;
}
