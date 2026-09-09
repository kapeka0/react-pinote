import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { PinoteIcon } from "./pinote-icon";
import type { PinoteAuthor, PinoteAuthorPlacement } from "./types";

type PinoteTriggerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  author: PinoteAuthor | undefined;
  triggerAside: ReactNode;
  authorPlacement: PinoteAuthorPlacement;
  icon: ReactNode;
  triggerRef: Ref<HTMLButtonElement>;
};

/** Visual trigger only; behavior comes from the interaction controller. */
export function PinoteTrigger({
  author,
  triggerAside,
  authorPlacement,
  icon,
  triggerRef,
  ...props
}: PinoteTriggerProps) {
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
      (!beside && avatar) || <PinoteIcon />
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
