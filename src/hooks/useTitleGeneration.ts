import { useCallback } from 'react';
import { useStore } from '../store/index.ts';

export function useTitleGeneration() {
  const activeConversationId = useStore((state) => state.activeConversationId);
  const messages = useStore((state) => state.messages);
  const conversations = useStore((state) => state.conversations);
  const providerConfig = useStore((state) => state.providerConfig);
  const updateConversationTitle = useStore((state) => state.updateConversationTitle);

  const generateTitle = useCallback(async () => {
    console.log('[TitleGen] generateTitle called');
    console.log('[TitleGen] activeConversationId:', activeConversationId);
    console.log('[TitleGen] messages.length:', messages.length);
    
    if (!activeConversationId) {
      console.log('[TitleGen] No activeConversationId, returning');
      return;
    }
    if (messages.length < 2) {
      console.log('[TitleGen] Not enough messages, returning');
      return;
    }

    const conv = conversations.find((c) => c.id === activeConversationId);
    console.log('[TitleGen] Found conversation:', conv);
    
    if (!conv || conv.title !== 'New Chat') {
      console.log('[TitleGen] Title already set or no conv, returning');
      return;
    }

    console.log('[TitleGen] Starting title generation, messages:', messages.length);

    // Get first 4 messages for context
    const contextMessages = messages.slice(0, 4).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.displayContent || m.content,
    }));

    console.log('[TitleGen] Context messages:', contextMessages);

    const titlePrompt = {
      role: 'system' as const,
      content: 'Generate a concise 3-5 word title for this conversation. Return ONLY the title, no quotes, no explanation.',
    };

    console.log('[TitleGen] Sending message to background...');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TITLE_GENERATE',
        messages: [titlePrompt, ...contextMessages],
        providerConfig: providerConfig,
      });

      console.log('[TitleGen] Response:', response);

      if (response?.title) {
        const title = response.title.trim().replace(/^["']|["']$/g, '').slice(0, 50);
        console.log('[TitleGen] Setting title:', title);
        updateConversationTitle(activeConversationId, title);
      }
    } catch (e) {
      console.warn('[TitleGen] Failed:', e);
    }
  }, [activeConversationId, messages, conversations, providerConfig, updateConversationTitle]);

  return {
    generateTitle,
  };
}
