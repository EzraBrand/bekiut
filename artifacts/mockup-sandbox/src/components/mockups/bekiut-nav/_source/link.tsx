import type { ComponentProps } from "react";

/** Sandbox boundary: retain source links visually without leaving the mockup. */
export function Link({ onClick, ...props }: ComponentProps<"a">) {
  return <a {...props} onClick={event => { event.preventDefault(); onClick?.(event); }} />;
}
