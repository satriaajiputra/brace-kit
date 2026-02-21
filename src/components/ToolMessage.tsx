import { WrenchIcon } from 'lucide-react';
import { useState } from 'react';

interface ToolMessageProps {
  name: string;
  content: string;
  toolCallId?: string;
  toolArguments?: Record<string, unknown>;
  isCachedResult?: boolean;
}

export function ToolMessage({ name, content, toolArguments, isCachedResult }: ToolMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCalling = content === '⏳ Calling...';
  const isError = content.startsWith('Error:');
  const statusIcon = isCalling ? '⏳' : isError ? '❌' : '✅';

  // Format arguments for display
  const argsDisplay = toolArguments
    ? Object.entries(toolArguments)
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join(', ')
    : '';

  return (
    <div className="flex flex-col gap-1 max-w-full self-start animate-fade-in">
      <div className="relative break-words overflow-wrap px-4 py-4 pb-3 bg-success-400/5 border border-success-400/20 rounded-lg text-sm">
        <div className="flex items-center gap-1.5 font-semibold text-success-400 mb-1.5 text-sm">
          <WrenchIcon size={14} />
          {statusIcon} {name}
          {isCachedResult && (
            <span className="ml-auto text-sm font-medium px-1.5 py-0.5 rounded bg-neutral-400/15 text-text-muted border border-neutral-400/25 tracking-wide" title="Result reused from an identical previous call">cached</span>
          )}
        </div>
        {argsDisplay && (
          <div className="mt-1 px-2 py-1 text-sm font-mono text-text-subtle bg-black/20 rounded-sm truncate">{argsDisplay}</div>
        )}
        {!isCalling && !isCachedResult && (
          <details className={`mt-1.5 rounded-sm overflow-hidden ${isError ? 'border-l-2 border-danger-400' : 'border-l-2 border-success-400'}`} open={isExpanded} onToggle={(e) => setIsExpanded((e.target as HTMLDetailsElement).open)}>
            <summary className="px-2 py-1.5 text-sm font-mono text-text-subtle bg-black/30 cursor-pointer truncate select-none hover:text-text-secondary">{content.length > 80 ? content.slice(0, 80) + '…' : content}</summary>
            <div className="px-2 py-2 text-sm font-mono text-text-muted bg-black/30 whitespace-pre-wrap break-words max-h-75 overflow-y-auto border-t border-white/5">{content}</div>
          </details>
        )}
      </div>
    </div>
  );
}
