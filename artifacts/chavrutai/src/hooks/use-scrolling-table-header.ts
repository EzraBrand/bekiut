import { useEffect, useRef } from "react";

/** Keep the sticky header and table body aligned inside separate horizontal scrollers. */
export function useScrollingTableHeader() {
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stickyHeader = stickyHeaderRef.current;
    const headerScroll = headerScrollRef.current;
    const bodyScroll = bodyScrollRef.current;
    if (!stickyHeader || !headerScroll || !bodyScroll) return;

    const siteHeader = document.querySelector("header.sticky");
    const updateStickyTop = () => {
      stickyHeader.style.top = `${Math.max(0, siteHeader?.getBoundingClientRect().bottom ?? 0)}px`;
    };

    const syncFromHeader = () => {
      if (bodyScroll.scrollLeft !== headerScroll.scrollLeft) {
        bodyScroll.scrollLeft = headerScroll.scrollLeft;
      }
    };
    const syncFromBody = () => {
      if (headerScroll.scrollLeft !== bodyScroll.scrollLeft) {
        headerScroll.scrollLeft = bodyScroll.scrollLeft;
      }
    };

    headerScroll.addEventListener("scroll", syncFromHeader, { passive: true });
    bodyScroll.addEventListener("scroll", syncFromBody, { passive: true });

    const observer = new ResizeObserver(updateStickyTop);
    if (siteHeader) observer.observe(siteHeader);
    updateStickyTop();

    return () => {
      headerScroll.removeEventListener("scroll", syncFromHeader);
      bodyScroll.removeEventListener("scroll", syncFromBody);
      observer.disconnect();
    };
  }, []);

  return { stickyHeaderRef, headerScrollRef, bodyScrollRef };
}