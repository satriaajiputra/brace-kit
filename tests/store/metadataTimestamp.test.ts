import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { useStore } from '../../src/store';

// Mock chrome storage and conversation DB
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

// Mock conversation DB functions
mock.module('../../src/utils/conversationDB', () => ({
  saveConversationMetadata: mock(() => Promise.resolve()),
  deleteConversationMetadata: mock(() => Promise.resolve()),
  getAllConversationMetadata: mock(() => Promise.resolve([])),
  saveConversationMessages: mock(() => Promise.resolve()),
  getConversationMessages: mock(() => Promise.resolve(null)),
  deleteConversationMessages: mock(() => Promise.resolve()),
  migrateOldConversations: mock(() => Promise.resolve()),
}));

// Mock image DB functions
mock.module('../../src/utils/imageDB', () => ({
  saveImagesForConversation: mock(() => Promise.resolve([])),
  hydrateMessages: mock((msgs: any) => Promise.resolve(msgs)),
  deleteImagesByConversation: mock(() => Promise.resolve()),
}));

// Mock memory sampler
mock.module('../../src/utils/memorySampler', () => ({
  selectMemoriesForConversation: mock(() => []),
  buildMemoryBlockFromSelection: mock(() => ''),
  refreshMemorySelection: mock(() => []),
}));

describe('Store - Static Metadata Timestamp', () => {
  beforeEach(() => {
    useStore.setState({
      conversations: [],
      activeConversationId: null,
      messages: [],
      memories: [],
      memoryEnabled: false,
    });
  });

  test('createConversation sets metadataTimestamp', () => {
    const store = useStore.getState();
    const conv = store.createConversation();

    expect(conv.metadataTimestamp).toBeDefined();
    expect(conv.metadataTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('createConversation metadataTimestamp is ISO string', () => {
    const store = useStore.getState();
    const conv = store.createConversation();

    const timestamp = conv.metadataTimestamp!;
    const date = new Date(timestamp);
    
    expect(date.toISOString()).toBe(timestamp);
    expect(isNaN(date.getTime())).toBe(false);
  });

  test('multiple conversations have different metadataTimestamp', async () => {
    const store = useStore.getState();
    
    const conv1 = store.createConversation({ title: 'Chat 1' });
    await new Promise(resolve => setTimeout(resolve, 10));
    const conv2 = store.createConversation({ title: 'Chat 2' });

    expect(conv1.metadataTimestamp).toBeDefined();
    expect(conv2.metadataTimestamp).toBeDefined();
    expect(conv1.metadataTimestamp).not.toBe(conv2.metadataTimestamp);
  });

  test('conversation metadataTimestamp persists in state', () => {
    const store = useStore.getState();
    const conv = store.createConversation({ title: 'Test' });
    
    const timestamp = conv.metadataTimestamp;
    const state = useStore.getState();
    const storedConv = state.conversations.find(c => c.id === conv.id);

    expect(storedConv?.metadataTimestamp).toBe(timestamp);
  });
});
