import { useState, useCallback } from 'react';
import { PencilIcon, RefreshCwIcon, GitBranchIcon } from 'lucide-react';
import { Btn } from '../../ui/Btn';
import { MessageCopyButton } from './CopyButton';
import type { UserActionsProps } from '../MessageBubble.types';

export function UserActions({
  content,
  messageIndex,
  isEditing,
  onEdit,
  onRegenerate,
  onBranch,
}: UserActionsProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleRegenerate = useCallback(async () => {
    if (!onRegenerate || messageIndex === undefined || isRegenerating) return;

    setIsRegenerating(true);
    setHasError(false);

    try {
      await onRegenerate(messageIndex);
    } catch {
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
    } finally {
      setIsRegenerating(false);
    }
  }, [onRegenerate, messageIndex, isRegenerating]);

  if (isEditing) return null;

  const regenerateClass = hasError
    ? 'text-red-500! bg-red-500/10!'
    : isRegenerating
      ? 'text-green-500! bg-green-500/10!'
      : '';

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 px-1 justify-end">
      <MessageCopyButton content={content} />
      {onEdit && (
        <Btn size="icon" variant="ghost" onClick={onEdit} title="Edit">
          <PencilIcon size={16} />
        </Btn>
      )}
      {onRegenerate && messageIndex !== undefined && (
        <Btn
          size="icon"
          variant="ghost"
          onClick={handleRegenerate}
          title="Regenerate"
          className={regenerateClass}
        >
          <RefreshCwIcon size={16} className={isRegenerating ? 'animate-spin' : ''} />
        </Btn>
      )}
      {onBranch && messageIndex !== undefined && (
        <Btn size="icon" variant="ghost" onClick={() => onBranch(messageIndex)} title="Branch">
          <GitBranchIcon size={16} />
        </Btn>
      )}
    </div>
  );
}
