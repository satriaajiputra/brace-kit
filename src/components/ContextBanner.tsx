import { usePageContext } from '../hooks/usePageContext.ts';
import { XIcon, GlobeIcon } from 'lucide-react';

export function ContextBanner() {
  const { pageContext, clearPageContext } = usePageContext();

  if (!pageContext) return null;

  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 backdrop-blur-md border-b border-border shrink-0 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 text-muted-foreground group">
        <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-sm text-primary transition-colors group-hover:bg-primary/20">
          <GlobeIcon size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-60">Inside Context</span>
          <span className="text-[11px] font-semibold text-foreground truncate max-w-[200px] mt-0.5">{pageContext.pageTitle || 'Current Page'}</span>
        </div>
      </div>
      <button
        className="flex items-center justify-center w-7 h-7 border-none bg-transparent text-muted-foreground rounded-full cursor-pointer transition-all duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-90"
        onClick={clearPageContext}
        title="Remove context"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
