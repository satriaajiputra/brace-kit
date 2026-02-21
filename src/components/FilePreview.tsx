import { useFileAttachments } from '../hooks/useFileAttachments.ts';
import { escapeHtml } from '../utils/markdown.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function FilePreview() {
  const { attachments, removeAttachment, clearAllAttachments } = useFileAttachments();

  if (attachments.length === 0) return null;

  return (
    <div className="flex items-start justify-between px-2.5 py-2 mb-1.5 bg-brand-400/[0.08] border border-brand-400/15 rounded-sm animate-slide-down gap-2">
      <div className="flex flex-wrap gap-2 flex-1">
        {attachments.map((att) => (
          <div
            key={att.id}
            className={`flex items-center gap-1.5 px-2 py-1.5 bg-bg-surface-raised border border-border rounded-sm text-[0.8rem] text-text-muted max-w-50 ${
              att.type === 'image' ? 'p-1 flex-col items-start gap-1' : ''
            }`}
          >
            {att.type === 'error' ? (
              <>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-danger-400 text-xs">{escapeHtml(att.name)}: {att.error}</span>
                </div>
                <button
                  className="flex items-center justify-center w-4 h-4 border-none bg-transparent text-text-subtle cursor-pointer rounded-full shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <CloseIcon size={12} />
                </button>
              </>
            ) : att.type === 'image' ? (
              <>
                <img src={att.data} alt={att.name} className="w-15 h-15 object-cover rounded-sm" />
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="truncate max-w-30">{escapeHtml(att.name)}</span>
                </div>
                <button
                  className="flex items-center justify-center w-4 h-4 border-none bg-transparent text-text-subtle cursor-pointer rounded-full shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <CloseIcon size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span>{att.type === 'pdf' ? '📄' : '📃'}</span>
                  <span className="truncate max-w-30">{escapeHtml(att.name)}</span>
                </div>
                <button
                  className="flex items-center justify-center w-4 h-4 border-none bg-transparent text-text-subtle cursor-pointer rounded-full shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <CloseIcon size={12} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <button
        className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-text-subtle rounded-full cursor-pointer shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
        onClick={clearAllAttachments}
        title="Remove all files"
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
