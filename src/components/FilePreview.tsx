import { useFileAttachments } from '../hooks/useFileAttachments.ts';
import { escapeHtml } from '../utils/markdown.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function FilePreview() {
  const { attachments, removeAttachment, clearAllAttachments } = useFileAttachments();

  if (attachments.length === 0) return null;

  return (
    <div id="file-preview">
      <div className="file-preview-list">
        {attachments.map((att) => (
          <div key={att.id} className={`file-preview-item ${att.type}`}>
            {att.type === 'error' ? (
              <>
                <div className="file-info">
                  <span className="file-error">{escapeHtml(att.name)}: {att.error}</span>
                </div>
                <button
                  className="file-remove"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <CloseIcon size={12} />
                </button>
              </>
            ) : att.type === 'image' ? (
              <>
                <img src={att.data} alt={att.name} />
                <div className="file-info">
                  <span className="file-name">{escapeHtml(att.name)}</span>
                </div>
                <button
                  className="file-remove"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <CloseIcon size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="file-info">
                  <span>{att.type === 'pdf' ? '📄' : '📃'}</span>
                  <span className="file-name">{escapeHtml(att.name)}</span>
                </div>
                <button
                  className="file-remove"
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
      <button className="context-clear" onClick={clearAllAttachments} title="Remove all files">
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
