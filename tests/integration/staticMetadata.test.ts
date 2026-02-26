import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { useStore } from '../../src/store';

// Mock dependencies
global.chrome = {
  storage: {
    local: {
      get: mock(() => Promise.resolve({})),
      set: mock(() => Promise.resolve()),
      remove: mock(() => Promise.resolve()),
    },
    session: {
      get: mock(() => Promise.resolve({})),
      set: mock(() => Promise.resolve()),
      remove: mock(() => Promise.resolve()),
    },
  },
} as any;

mock.module('../../src/utils/conversationDB', () => ({
  saveConversationMetadata: mock(() => Promise.resolve()),
  deleteConversationMetadata: mock(() => Promise.resolve()),
  getAllConversationMetadata: mock(() => Promise.resolve([])),
  saveConversationMessages: mock(() => Promise.resolve()),
  getConversationMessages: mock(() => Promise.resolve(null)),
  deleteConversationMessages: mock(() => Promise.resolve()),
  migrateOldConversations: mock(() => Promise.resolve()),
}));

mock.module('../../src/utils/imageDB', () => ({
  saveImagesForConversation: mock(() => Promise.resolve([])),
  hydrateMessages: mock((msgs: any) => Promise.resolve(msgs)),
  deleteImagesByConversation: mock(() => Promise.resolve()),
}));


describe('Static Metadata Timestamp - Integration', () => {
  beforeEach(() => {
    useStore.setState({
      conversations: [],
      activeConversationId: null,
      messages: [],
      memories: [],
      memoryEnabled: false,
      providerConfig: {
        providerId: 'openai',
        apiKey: 'test-key',
        apiUrl: '',
        model: 'gpt-4',
        format: 'openai',
        systemPrompt: 'You are a helpful assistant.',
      },
    });
  });

  test('store creates conversation with metadataTimestamp', () => {
    const store = useStore.getState();
    const conv = store.createConversation({ title: 'Test Chat' });
    
    expect(conv.metadataTimestamp).toBeDefined();
    expect(conv.metadataTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('metadataTimestamp persists in store state', () => {
    const store = useStore.getState();
    const conv = store.createConversation({ title: 'Test Chat' });
    const staticTimestamp = conv.metadataTimestamp!;
    
    const state = useStore.getState();
    const storedConv = state.conversations.find(c => c.id === conv.id);
    
    expect(storedConv?.metadataTimestamp).toBe(staticTimestamp);
  });

  test('metadataTimestamp remains static across message additions', async () => {
    const store = useStore.getState();
    const conv = store.createConversation({ title: 'Multi-turn' });
    const staticTimestamp = conv.metadataTimestamp!;
    
    store.addMessage({ role: 'user', content: 'Message 1' });
    await new Promise(resolve => setTimeout(resolve, 5));
    
    store.addMessage({ role: 'assistant', content: 'Response 1' });
    await new Promise(resolve => setTimeout(resolve, 5));
    
    store.addMessage({ role: 'user', content: 'Message 2' });
    
    const state = useStore.getState();
    const updatedConv = state.conversations.find(c => c.id === conv.id);
    
    expect(updatedConv?.metadataTimestamp).toBe(staticTimestamp);
  });

  test('buildMetadataBlock uses static timestamp from active conversation', () => {
    const store = useStore.getState();
    const conv = store.createConversation({ title: 'Test' });
    const staticTimestamp = conv.metadataTimestamp!;
    
    const state = useStore.getState();
    const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
    const timestamp = activeConv?.metadataTimestamp || new Date().toISOString();
    
    expect(timestamp).toBe(staticTimestamp);
    
    const metadataBlock = `\n\n<metadata>{"currentTime": "${timestamp}"}</metadata>`;
    expect(metadataBlock).toContain(staticTimestamp);
  });

  test('multiple conversations have different timestamps', async () => {
    const store = useStore.getState();
    
    const conv1 = store.createConversation({ title: 'Chat 1' });
    await new Promise(resolve => setTimeout(resolve, 10));
    const conv2 = store.createConversation({ title: 'Chat 2' });
    
    expect(conv1.metadataTimestamp).not.toBe(conv2.metadataTimestamp);
  });
});
