import { usePageContext } from '../hooks/usePageContext.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function ContextBanner() {
  const { pageContext, clearPageContext } = usePageContext();

  if (!pageContext) return null;

  return (
    <div id="context-banner">
      <div className="context-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span id="context-label">📄 {pageContext.pageTitle || 'Page attached'}</span>
      </div>
      <button className="context-clear" onClick={clearPageContext} title="Remove context">
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
