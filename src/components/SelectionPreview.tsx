import { usePageContext } from '../hooks/usePageContext.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

export function SelectionPreview() {
  const { selectedText, clearSelection } = usePageContext();

  if (!selectedText) return null;

  const displayText = selectedText.selectedText.length > 80
    ? selectedText.selectedText.substring(0, 80) + '...'
    : selectedText.selectedText;

  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 bg-purple-400/[0.08] border border-purple-400/15 rounded-sm animate-slide-down">
      <div className="flex items-center gap-1.5 text-[0.8rem] text-accent-subtle overflow-hidden">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
        <span className="truncate max-w-60">{displayText}</span>
      </div>
      <button
        className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-text-subtle rounded-full cursor-pointer shrink-0 transition-all duration-150 hover:bg-danger-400/20 hover:text-danger-400"
        onClick={clearSelection}
        title="Remove selection"
      >
        <CloseIcon size={10} />
      </button>
    </div>
  );
}
