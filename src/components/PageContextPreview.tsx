import { usePageContext } from '../hooks/usePageContext.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function PageContextPreview() {
  const { pageContext, clearPageContext } = usePageContext();

  if (!pageContext) return null;

  return (
    <div className="page-context-preview">
      <div className="page-context-card">
        <div className="page-context-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div className="page-context-info">
          <div className="page-context-title">{pageContext.pageTitle}</div>
          <div className="page-context-url">{pageContext.pageUrl}</div>
        </div>
        <button className="page-context-remove" onClick={clearPageContext} title="Remove page context">
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
