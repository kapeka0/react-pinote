import { useEffect } from "react";
import type { RefObject } from "react";

const SHADCN_TOKENS = new Set([
  "--popover",
  "--popover-foreground",
  "--radius",
]);

/** Preserve inherited theme tokens when the content moves into a portal. */
export function usePortalTheme(
  open: boolean,
  source: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  portalRoot: HTMLElement | null | false,
) {
  useEffect(() => {
    const root = source.current;
    const panel = target.current;
    if (!root) return;
    let copied: string[] = [];
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const sync = () => {
      const explicit = root.closest(".dark,.light");
      const theme = explicit
        ? explicit.classList.contains("dark")
          ? "dark"
          : "light"
        : media?.matches
          ? "dark"
          : "light";
      root.dataset.pinoteTheme = theme;
      if (!open || !panel) return;
      for (const token of copied) panel.style.removeProperty(token);
      copied = [];
      const computed = getComputedStyle(root);
      for (const token of Array.from(computed)) {
        if (token.startsWith("--pinote-") || SHADCN_TOKENS.has(token)) {
          panel.style.setProperty(token, computed.getPropertyValue(token));
          copied.push(token);
        }
      }
      panel.dataset.pinoteTheme = theme;
      panel.dir = computed.direction || "ltr";
    };
    sync();
    const observer = new MutationObserver(sync);
    // Observe only ancestry: writes to the portal must not trigger a loop.
    for (let node: HTMLElement | null = root; node; node = node.parentElement) {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["class", "style", "dir"],
      });
    }
    media?.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", sync);
    };
  }, [open, source, target, portalRoot]);
}
