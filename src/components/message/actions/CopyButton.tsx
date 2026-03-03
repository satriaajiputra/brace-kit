import { useState, useCallback } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { Btn } from '../../ui/Btn';
import { copyToClipboard } from '../../../utils/formatters';
import type { MessageCopyButtonProps } from '../MessageBubble.types';

export function MessageCopyButton({ content }: MessageCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [content]);

  return (
    <Btn
      size="icon"
      variant="ghost"
      className={copied ? 'text-green-500! bg-green-500/10!' : ''}
      onClick={handleCopy}
      title="Copy"
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </Btn>
  );
}
