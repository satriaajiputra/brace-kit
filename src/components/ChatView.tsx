import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store/index.ts';
import { MessageList } from './MessageList.tsx';
import { WelcomeScreen } from './WelcomeScreen.tsx';
import { InputArea } from './InputArea.tsx';
import { SystemPromptEditor } from './SystemPromptEditor.tsx';
import { TextInput } from './ui/TextInput.tsx';
import { Btn } from './ui/Btn.tsx';
import { SquarePenIcon } from 'lucide-react';

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
    <div className="border-b border-text-subtle/20 flex justify-between items-center gap-4 px-1 py-2">
      {isEditing ? (
        <TextInput
          ref={inputRef}
          className="w-full h-7"
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
          <Btn
            size="icon-sm"
            variant="ghost"
            title="Rename conversation"
            onClick={startEdit}
          >
            <SquarePenIcon size={14} />
          </Btn>
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
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
