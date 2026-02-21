import { usePageContext } from '../hooks/usePageContext.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function PageContextPreview() {
  const { pageContext, clearPageContext } = usePageContext();

  if (!pageContext) return null;

  return (
    <div className="mb-1.5 animate-slide-down">
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-brand-400/[0.08] border border-brand-400/15 rounded-md">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-400/15 rounded-sm text-accent shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-[0.85rem] font-semibold text-text-default truncate mb-0.5">{pageContext.pageTitle}</div>
          <div className="text-xs text-text-subtle truncate">{pageContext.pageUrl}</div>
        </div>
        <button
          className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-text-subtle rounded-full cursor-pointer shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
          onClick={clearPageContext}
          title="Remove page context"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
