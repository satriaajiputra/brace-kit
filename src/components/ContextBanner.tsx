import { usePageContext } from '../hooks/usePageContext.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function ContextBanner() {
  const { pageContext, clearPageContext } = usePageContext();

  if (!pageContext) return null;

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-brand-400/8 border-b border-brand-400/15 shrink-0 animate-slide-down">
      <div className="flex items-center gap-1.5 text-brand-400 text-sm font-medium">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>📄 {pageContext.pageTitle || 'Page attached'}</span>
      </div>
      <button
        className="flex items-center justify-center w-5 h-5 border-none bg-transparent text-text-subtle rounded-full cursor-pointer transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
        onClick={clearPageContext}
        title="Remove context"
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
