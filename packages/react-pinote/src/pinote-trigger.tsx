import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import { CustomTrigger } from "./custom-trigger";
import type { PinoteRender, PinoteTriggerState } from "./types";
import type { PinoteAuthor, PinoteAuthorPlacement } from "./types";

type PinoteTriggerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  author: PinoteAuthor | undefined;
  triggerAside: ReactNode;
  authorPlacement: PinoteAuthorPlacement;
  icon: ReactNode;
  triggerRef: RefObject<HTMLButtonElement | null>;
  render: PinoteRender | undefined;
  state: PinoteTriggerState;
};

/** Visual trigger only; behavior comes from the interaction controller. */
export function PinoteTrigger({
  author,
  triggerAside,
  authorPlacement,
  icon,
  triggerRef,
  render,
  state,
  ...props
}: PinoteTriggerProps) {
  if (render)
    return typeof render === "function" ? (
      render({ ...props, ref: triggerRef }, state)
    ) : (
      <CustomTrigger
        element={render}
        triggerProps={props}
        triggerRef={triggerRef}
      />
    );
  const beside = authorPlacement === "beside";
  const hasAside = triggerAside != null || (beside && author?.avatarUrl);
  const avatar = author?.avatarUrl ? (
    <img
      alt=""
      className={`pn-v${beside ? " pn-b" : ""}`}
      data-slot="pinote-avatar"
      draggable={false}
      src={author.avatarUrl}
      style={
        beside
          ? {
              position: "absolute",
              left: "var(--pinote-aside-offset,9px)",
              top: 0,
              width: "100%",
              outline: "1px solid var(--pn-s)",
            }
          : undefined
      }
    />
  ) : null;
  const mark =
    icon !== undefined ? (
      <span aria-hidden="true" data-slot="pinote-icon">
        {icon}
      </span>
    ) : (
      !beside && avatar
    );
  return (
    <button {...props} ref={triggerRef}>
      {hasAside &&
        (triggerAside != null ? (
          <span
            className="pn-b"
            data-slot="pinote-trigger-aside"
            style={{
              position: "absolute",
              left: "var(--pinote-aside-offset,9px)",
              top: 0,
              isolation: "isolate",
            }}
          >
            {triggerAside}
          </span>
        ) : (
          avatar
        ))}
      {hasAside ? <span className="pn-f">{mark}</span> : mark}
    </button>
  );
}
