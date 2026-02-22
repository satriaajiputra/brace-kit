import { useCallback, useState } from 'react';
import { copyToClipboard } from '../utils/formatters.ts';
import { XIcon } from 'lucide-react';

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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-[500px] h-[80vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-foreground overflow-hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-sm font-bold truncate uppercase tracking-tight">{fileName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className={`flex items-center gap-1.5 h-8 px-2.5 text-xs font-bold uppercase tracking-tight transition-all rounded-sm border ${copied
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              onClick={handleCopy}
              title="Copy content"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-bold uppercase tracking-tight bg-primary text-primary-foreground rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-sm"
              onClick={handleDownload}
              title="Download file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-all"
              onClick={onClose}
              title="Close"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-card">
          <pre className="text-xs font-mono leading-relaxed text-foreground bg-muted/20 p-4 rounded-md border border-border/50 whitespace-pre-wrap wrap-break-word">{content}</pre>
        </div>
      </div>
    </div>
  );
}
