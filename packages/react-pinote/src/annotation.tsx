import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { PinoteIcon } from "./pinote-icon";
import { usePinoteContext } from "./pinote-context";
import { usePinotePosition } from "./use-pinote-position";
import { usePortalTheme } from "./use-portal-theme";
import type {
  PinoteAppearance,
  PinotePlacement,
  PinotePosition,
} from "./types";

type AnnotationProps = PinoteAppearance & {
  position?: PinotePosition | PinotePlacement;
  highlight?: boolean;
  children?: ReactNode;
};

const FOCUSABLE = "a[href],button,input,select,textarea,[tabindex]";

function focusableChildren(element: HTMLElement | null) {
  return Array.from(
    element?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
  ).filter(
    (node) =>
      node.tabIndex >= 0 &&
      !node.matches(':disabled,[hidden],[aria-hidden="true"]') &&
      !node.closest("[hidden],[inert]"),
  );
}

export function Annotation({
  id,
  content,
  author,
  icon,
  animation,
  className,
  style,
  position = "top-right",
  highlight = false,
  children,
  "aria-label": label,
}: AnnotationProps) {
  const context = usePinoteContext();
  const isOpen = context.ready && context.openId === id;
  const contentId = useId();
  const attached = highlight || children != null;
  const Root = attached && !highlight ? "div" : "span";
  const point =
    typeof position === "string"
      ? {
          x: position.includes("left")
            ? 0
            : position.includes("right")
              ? 100
              : 50,
          y: position.includes("top")
            ? 0
            : position.includes("bottom")
              ? 100
              : 50,
        }
      : position;
  const coordinates = { left: `${point.x}%`, top: `${point.y}%` };
  const rootRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressFocus = useRef(false);
  const suppressHover = useRef(false);
  const pointerInside = useRef(false);
  const latest = useRef(context);
  latest.current = context;
  const portalRoot = context.portal ? context.portalContainer : false;
  const floating = usePinotePosition(
    isOpen,
    triggerRef,
    contentRef,
    portalRoot,
  );
  usePortalTheme(isOpen, rootRef, contentRef, portalRoot);

  const cancelDismiss = () => clearTimeout(timeout.current);
  const restoreFocus = () => {
    suppressHover.current = true;
    suppressFocus.current = true;
    triggerRef.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
  };
  const preview = () => {
    cancelDismiss();
    if (!suppressFocus.current) latest.current.preview(id);
  };
  const dismiss = () => {
    cancelDismiss();
    timeout.current = setTimeout(() => {
      const active = document.activeElement;
      if (
        !pointerInside.current &&
        !rootRef.current?.contains(active) &&
        !contentRef.current?.contains(active)
      ) {
        latest.current.dismissPreview(id);
      }
    }, 160);
  };
  const enter = () => {
    pointerInside.current = true;
    if (!suppressHover.current) preview();
  };
  // Removing a portal can uncover its trigger and synthesize mouseenter.
  // Only a fresh pointer movement may reopen an explicitly dismissed preview.
  const resumeHover = () => {
    if (suppressHover.current) {
      suppressHover.current = false;
      preview();
    }
  };
  const leave = () => {
    pointerInside.current = false;
    dismiss();
  };

  useEffect(() => () => clearTimeout(timeout.current), []);
  useEffect(() => {
    if (!isOpen) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        suppressHover.current = true;
        latest.current.close();
      }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      suppressHover.current = true;
      event.preventDefault();
      if (contentRef.current?.contains(document.activeElement)) restoreFocus();
      latest.current.close();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen]);

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab" && !event.shiftKey && isOpen) {
      const first = focusableChildren(contentRef.current)[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  const panel = isOpen ? (
    <div
      aria-label={label ?? (author ? `${author.name}'s pinote` : "Pinote")}
      className={`pn pn-c ${className ?? ""}`}
      data-animation={animation ?? context.animation}
      data-side={floating.side}
      data-slot="pinote-content"
      id={contentId}
      ref={contentRef}
      role="dialog"
      tabIndex={-1}
      style={{ ...style, ...floating.style }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={cancelDismiss}
      onBlur={dismiss}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const nodes = focusableChildren(contentRef.current);
        if (
          event.shiftKey &&
          (event.target === nodes[0] || event.target === contentRef.current)
        ) {
          event.preventDefault();
          restoreFocus();
        } else if (
          !event.shiftKey &&
          (event.target === nodes.at(-1) || nodes.length === 0)
        ) {
          restoreFocus();
          latest.current.close();
        }
      }}
    >
      {author && (
        <div className="pn-a" data-slot="pinote-author">
          {author.avatarUrl && (
            <img alt="" data-slot="pinote-avatar" src={author.avatarUrl} />
          )}
          <bdi>{author.name}</bdi>
        </div>
      )}
      <div data-slot="pinote-body">{content}</div>
    </div>
  ) : null;

  return (
    <>
      <Root
        className={`pn ${attached ? `pn-w ${highlight ? "pn-h" : ""}` : "pn-p"} ${className ?? ""}`}
        data-slot={
          highlight
            ? "pinote-highlight"
            : attached
              ? "pinote-attachment"
              : "pinote"
        }
        data-state={isOpen ? "open" : "closed"}
        ref={(node) => {
          rootRef.current = node;
        }}
        style={{ ...style, ...(!attached ? coordinates : {}) }}
        onMouseEnter={highlight ? enter : undefined}
        onMouseLeave={highlight ? leave : undefined}
        onMouseMove={highlight ? resumeHover : undefined}
        onBlur={dismiss}
      >
        {highlight && (
          <span
            data-slot="pinote-highlight-text"
            onClick={() => context.togglePersistent(id)}
          >
            {children}
          </span>
        )}
        {!highlight && children}
        <button
          aria-controls={isOpen ? contentId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={
            label ??
            (author ? `Open pinote from ${author.name}` : "Open pinote")
          }
          data-slot="pinote-trigger"
          className="pn-t"
          style={
            attached
              ? { position: "absolute", ...coordinates, translate: "-50% -50%" }
              : undefined
          }
          onMouseEnter={!highlight ? enter : undefined}
          onMouseLeave={!highlight ? leave : undefined}
          onMouseMove={!highlight ? resumeHover : undefined}
          onClick={(event) => {
            context.togglePersistent(id);
            if (event.detail === 0 && !(isOpen && context.persistent)) {
              requestAnimationFrame(() =>
                (
                  focusableChildren(contentRef.current)[0] ?? contentRef.current
                )?.focus(),
              );
            }
          }}
          onFocus={preview}
          onKeyDown={keyDown}
          ref={triggerRef}
          type="button"
        >
          {icon !== undefined ? (
            <span aria-hidden="true" data-slot="pinote-icon">
              {icon}
            </span>
          ) : author?.avatarUrl ? (
            <img alt="" data-slot="pinote-avatar" src={author.avatarUrl} />
          ) : (
            <PinoteIcon />
          )}
        </button>
      </Root>
      {panel &&
        (context.portal
          ? createPortal(panel, context.portalContainer ?? document.body)
          : panel)}
    </>
  );
}
