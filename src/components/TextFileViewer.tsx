import { useCallback, useState } from 'react';
import { copyToClipboard } from '../utils/formatters.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

interface TextFileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  content: string;
}

export function TextFileViewer({ isOpen, onClose, fileName, content }: TextFileViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fileName, content]);

  if (!isOpen) return null;

  return (
    <div className="text-file-viewer-overlay" onClick={onClose}>
      <div className="text-file-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="text-file-viewer-header">
          <div className="text-file-viewer-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>{fileName}</span>
          </div>
          <div className="text-file-viewer-actions">
            <button className={`viewer-action-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy content">
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
            <button className="viewer-action-btn" onClick={handleDownload} title="Download file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </button>
            <button className="viewer-close-btn" onClick={onClose} title="Close">
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
        <div className="text-file-viewer-content">
          <pre>{content}</pre>
        </div>
      </div>
    </div>
  );
}
