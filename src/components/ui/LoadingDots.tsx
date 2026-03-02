/**
 * LoadingDots - Animated loading indicator with three bouncing dots.
 * Used during message streaming when no content is available yet.
 */
export function LoadingDots() {
  return (
    <div className="flex gap-1 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
    </div>
  );
}
