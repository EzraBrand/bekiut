import { useEffect, useRef, useState, type RefObject } from "react";

/** A visible bottom scrollbar even on devices that hide native scrollbars. */
export function BottomTableScrollbar({ scrollRef, controls }: {
  scrollRef: RefObject<HTMLDivElement | null>;
  controls: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [metrics, setMetrics] = useState({ left: 0, width: 0, total: 0 });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const update = () => {
      const next = { left: element.scrollLeft, width: element.clientWidth, total: element.scrollWidth };
      setMetrics(old => old.left === next.left && old.width === next.width && old.total === next.total ? old : next);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    const table = element.querySelector("table");
    if (table) observer.observe(table);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [scrollRef]);

  const max = Math.max(0, metrics.total - metrics.width);
  if (!max) return null;
  const ratio = metrics.width / metrics.total;
  const moveTo = (left: number) => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, Math.min(max, left));
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background px-6 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div
        ref={trackRef}
        role="scrollbar"
        aria-label="Scroll table horizontally"
        aria-orientation="horizontal"
        aria-controls={controls}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-valuenow={Math.round(metrics.left)}
        tabIndex={0}
        data-testid="bottom-table-scrollbar"
        className="relative mx-auto h-7 max-w-content rounded bg-muted touch-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        onKeyDown={event => {
          const amounts: Record<string, number> = {
            ArrowLeft: metrics.left - 40, ArrowRight: metrics.left + 40,
            PageUp: metrics.left - metrics.width, PageDown: metrics.left + metrics.width,
            Home: 0, End: max,
          };
          if (event.key in amounts) {
            event.preventDefault();
            moveTo(amounts[event.key]);
          }
        }}
        onPointerDown={event => {
          event.preventDefault();
          const track = event.currentTarget;
          const rect = track.getBoundingClientRect();
          const thumbStart = metrics.left / metrics.total * rect.width;
          const x = event.clientX - rect.left;
          const left = x >= thumbStart && x <= thumbStart + ratio * rect.width
            ? metrics.left
            : (x / rect.width * metrics.total) - metrics.width / 2;
          moveTo(left);
          drag.current = { x: event.clientX, left: Math.max(0, Math.min(max, left)) };
          track.focus({ preventScroll: true });
          track.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          if (!drag.current || !trackRef.current) return;
          moveTo(drag.current.left + (event.clientX - drag.current.x) / trackRef.current.clientWidth * metrics.total);
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onLostPointerCapture={() => { drag.current = null; }}
      >
        <div
          className="absolute inset-y-1 rounded bg-muted-foreground/70"
          style={{ width: `${ratio * 100}%`, left: `${metrics.left / metrics.total * 100}%` }}
        />
      </div>
    </div>
  );
}