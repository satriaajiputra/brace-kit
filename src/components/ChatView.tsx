import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store/index.ts';
import { MessageList } from './MessageList.tsx';
import { WelcomeScreen } from './WelcomeScreen.tsx';
import { InputArea } from './InputArea.tsx';
import { SystemPromptEditor } from './SystemPromptEditor.tsx';

function ConversationTitleBar() {
  const activeConversationId = useStore((state) => state.activeConversationId);
  const conversations = useStore((state) => state.conversations);
  const updateConversationTitle = useStore((state) => state.updateConversationTitle);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const startEdit = useCallback(() => {
    if (!activeConv) return;
    setEditValue(activeConv.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [activeConv]);

  const commit = useCallback(() => {
    if (activeConversationId && editValue.trim()) {
      updateConversationTitle(activeConversationId, editValue.trim());
    }
    setIsEditing(false);
  }, [activeConversationId, editValue, updateConversationTitle]);

  const cancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!activeConv) return null;

  return (
    <div className="conversation-title-bar">
      {isEditing ? (
        <input
          ref={inputRef}
          className="conversation-title-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cancel();
          }}
          onBlur={commit}
        />
      ) : (
        <>
          <span
            className="conversation-title-text"
            title="Double-click to rename"
            onDoubleClick={startEdit}
          >
            {activeConv.title}
          </span>
          <button
            className="conversation-title-edit-btn"
            title="Rename conversation"
            onClick={startEdit}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export function ChatView() {
  const messages = useStore((state) => state.messages);
  const showSystemPromptEditor = useStore((state) => state.showSystemPromptEditor);
  const setShowSystemPromptEditor = useStore((state) => state.setShowSystemPromptEditor);

  return (
    <>
      <div id="chat-view">
        {showSystemPromptEditor && (
          <SystemPromptEditor onClose={() => setShowSystemPromptEditor(false)} />
        )}
        <ConversationTitleBar />
        {messages.length === 0 ? <WelcomeScreen /> : <MessageList />}
      </div>
      <InputArea />
    </>
  );
}
