import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import { usePinoteContext } from "./pinote-context";
import { getPinotePosition } from "./position";
import type { PinoteAppearance, PinotePosition } from "./types";

const FOCUSABLE =
  'a[href],button,input,select,textarea,[tabindex],[contenteditable="true"]';
function focusableChildren(element: HTMLElement | null) {
  return Array.from(
    element?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
  ).filter((node) => {
    if (
      node.tabIndex < 0 ||
      node.matches(":disabled") ||
      node.closest('[hidden],[inert],[aria-hidden="true"]')
    )
      return false;
    if (["hidden", "collapse"].includes(getComputedStyle(node).visibility))
      return false;
    for (
      let ancestor: HTMLElement | null = node;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      const style = getComputedStyle(ancestor);
      if (style.display === "none" || style.contentVisibility === "hidden")
        return false;
    }
    return true;
  });
}

type Drag = {
  pointer: number;
  button: HTMLButtonElement;
  layer: Element;
  origin: PinotePosition;
  next: PinotePosition;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

type Options = Pick<
  PinoteAppearance,
  "id" | "preview" | "initialFocusRef" | "onInteractOutside"
> & {
  expand: boolean;
  draggable: boolean;
  position: PinotePosition;
  onPositionChange: (position: PinotePosition) => void;
  onDragEnd: ((position: PinotePosition) => void) | undefined;
};

/** Owns the complete gesture: preview, activation, capture, release and focus. */
export function usePinoteInteraction({
  id,
  preview: allowPreview = true,
  initialFocusRef,
  onInteractOutside,
  expand,
  draggable,
  position,
  onPositionChange,
  onDragEnd,
}: Options) {
  const context = usePinoteContext();
  const latest = useRef(context);
  useEffect(() => {
    latest.current = context;
  }, [context]);
  const isOpen = context.ready && context.openId === id;
  const [isPreview, setIsPreview] = useState(!context.persistent);
  if (isOpen && isPreview === context.persistent)
    setIsPreview(!context.persistent);
  const [focusVisible, setFocusVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressFocus = useRef(false);
  const suppressHover = useRef(false);
  const waitForLeave = useRef(false);
  const pointerInside = useRef(false);
  const pressedPersistent = useRef(false);
  const active = useRef<Drag | null>(null);
  const blockClick = useRef(false);

  const focusContent = useCallback(() => {
    (
      initialFocusRef?.current ??
      focusableChildren(contentRef.current)[0] ??
      contentRef.current
    )?.focus({ preventScroll: true });
  }, [initialFocusRef]);
  const cancelDismiss = () => clearTimeout(timeout.current);
  const restoreFocus = useCallback(() => {
    suppressHover.current = true;
    suppressFocus.current = true;
    triggerRef.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
  }, []);
  const open = useCallback(() => latest.current.open(id), [id]);
  const close = useCallback(() => {
    if (contentRef.current?.contains(document.activeElement)) restoreFocus();
    if (latest.current.openId === id) latest.current.close();
  }, [id, restoreFocus]);
  const toggle = () => {
    if (triggerRef.current?.disabled) return;
    if (isOpen && context.persistent) close();
    else open();
  };
  const preview = () => {
    cancelDismiss();
    if (
      allowPreview &&
      !triggerRef.current?.disabled &&
      !suppressFocus.current &&
      !waitForLeave.current &&
      !active.current
    )
      latest.current.preview(id);
  };
  const dismiss = () => {
    cancelDismiss();
    timeout.current = setTimeout(
      () => {
        const focused = document.activeElement;
        if (
          !pointerInside.current &&
          !(
            rootRef.current?.contains(focused) &&
            focused?.matches(":focus-visible")
          ) &&
          !contentRef.current?.contains(focused)
        )
          latest.current.dismissPreview(id);
      },
      expand ? 40 : 160,
    );
  };
  const enter = () => {
    pointerInside.current = true;
    if (!suppressHover.current) preview();
  };
  // Removing a portal can synthesize mouseenter on the uncovered trigger.
  // A fresh movement can reopen it; after a drag, require leaving first.
  const resumeHover = () => {
    if (suppressHover.current && !waitForLeave.current && !active.current) {
      suppressHover.current = false;
      preview();
    }
  };
  const leave = () => {
    pointerInside.current = false;
    if (!active.current) waitForLeave.current = false;
    dismiss();
  };
  const blur = (event: FocusEvent<HTMLElement>) => {
    setFocusVisible(false);
    if (
      !suppressFocus.current &&
      !rootRef.current?.contains(event.relatedTarget) &&
      !contentRef.current?.contains(event.relatedTarget)
    )
      onInteractOutside?.(event.nativeEvent);
    dismiss();
  };
  useEffect(() => () => clearTimeout(timeout.current), []);
  useEffect(() => {
    if (!isOpen && !onInteractOutside) return;
    const outside = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        onInteractOutside?.(event);
        if (event.defaultPrevented) return;
        suppressHover.current = true;
        if (latest.current.openId === id) latest.current.close();
      }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        latest.current.openId !== id
      )
        return;
      suppressHover.current = true;
      event.preventDefault();
      close();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, onInteractOutside, id, close]);

  const finish = (cancel: boolean) => {
    const drag = active.current;
    active.current = null;
    if (!drag) return;
    setDragging(false);
    drag.button.removeAttribute("data-dragging");
    if (drag.moved) {
      blockClick.current = true;
      if (cancel) onPositionChange(drag.origin);
      else onDragEnd?.(drag.next);
    }
    if (drag.button.hasPointerCapture(drag.pointer))
      drag.button.releasePointerCapture(drag.pointer);
  };
  const pointerDown = (event: PointerEvent<HTMLElement>) => {
    pressedPersistent.current = isOpen && context.persistent;
    if (!draggable || !event.isPrimary || event.button !== 0 || active.current)
      return;
    const button = triggerRef.current!;
    const layer = button.closest('[data-slot="pinote-layer"]');
    if (!layer) return;
    button.getAnimations().forEach((animation) => animation.finish());
    const rect = anchorRef.current!.getBoundingClientRect();
    blockClick.current = false;
    active.current = {
      pointer: event.pointerId,
      button,
      layer,
      origin: position,
      next: position,
      x: event.clientX,
      y: event.clientY,
      offsetX: rect.left + rect.width / 2 - event.clientX,
      offsetY: rect.top + rect.height / 2 - event.clientY,
      moved: false,
    };
    button.setPointerCapture(event.pointerId);
    button.setAttribute("data-dragging", "");
    setDragging(true);
    suppressHover.current = true;
    waitForLeave.current = true;
    latest.current.close();
  };
  const state = useMemo(
    () => ({ id, isOpen, isPreview, open, close }),
    [id, isOpen, isPreview, open, close],
  );
  return {
    context,
    isOpen,
    state,
    focusVisible,
    dragging,
    rootRef,
    anchorRef,
    triggerRef,
    contentRef,
    focusContent,
    toggle,
    blur,
    hoverProps: {
      onMouseEnter: enter,
      onMouseLeave: leave,
      onMouseMove: resumeHover,
    },
    triggerProps: {
      onClick(event: MouseEvent<HTMLButtonElement>) {
        if (draggable && pressedPersistent.current && event.detail !== 0)
          return;
        toggle();
      },
      onFocus(event: FocusEvent<HTMLButtonElement>) {
        setFocusVisible(event.currentTarget.matches(":focus-visible"));
        preview();
      },
      onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "Tab" && !event.shiftKey && isOpen) {
          const first = focusableChildren(contentRef.current)[0];
          if (first) {
            event.preventDefault();
            first.focus();
          }
        }
      },
      onPointerDown: pointerDown,
      onPointerMove(event: PointerEvent<HTMLButtonElement>) {
        const drag = active.current;
        if (
          !drag ||
          event.pointerId !== drag.pointer ||
          (!drag.moved &&
            Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4)
        )
          return;
        drag.moved = true;
        event.preventDefault();
        drag.next = getPinotePosition(
          {
            clientX: event.clientX + drag.offsetX,
            clientY: event.clientY + drag.offsetY,
          },
          drag.layer,
        );
        onPositionChange(drag.next);
      },
      onPointerUp(event: PointerEvent<HTMLButtonElement>) {
        if (event.pointerId === active.current?.pointer) finish(false);
      },
      onPointerCancel(event: PointerEvent<HTMLButtonElement>) {
        if (event.pointerId === active.current?.pointer) finish(true);
      },
      onLostPointerCapture(event: PointerEvent<HTMLButtonElement>) {
        if (event.pointerId === active.current?.pointer) finish(true);
      },
      onClickCapture(event: MouseEvent<HTMLButtonElement>) {
        if (blockClick.current && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
          blockClick.current = false;
        }
      },
    },
    panelProps: {
      onMouseEnter: enter,
      onMouseLeave: leave,
      onFocus: cancelDismiss,
      onBlur: blur,
      onPointerDown(event: PointerEvent<HTMLDivElement>) {
        if (!expand || !draggable) return;
        const marker = anchorRef.current!.getBoundingClientRect();
        if (
          event.clientX >= marker.left &&
          event.clientX <= marker.right &&
          event.clientY >= marker.top &&
          event.clientY <= marker.bottom
        )
          pointerDown(event);
      },
      onClick(event: MouseEvent<HTMLDivElement>) {
        if (
          event.defaultPrevented ||
          (event.target as HTMLElement).closest(
            'a,button,input,textarea,select,[contenteditable="true"]',
          ) ||
          !window.getSelection()?.isCollapsed
        )
          return;
        if (!context.persistent) open();
        else focusContent();
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
      },
    },
  };
}

export type PinoteInteraction = ReturnType<typeof usePinoteInteraction>;
