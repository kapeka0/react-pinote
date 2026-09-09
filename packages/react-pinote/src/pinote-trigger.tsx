import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import { forwardRef } from "react";
import { CustomTrigger } from "./custom-trigger";
import { pinoteRadius } from "./pinote-shape";
import type {
  PinoteRender,
  PinoteTriggerProps,
  PinoteTriggerState,
} from "./types";
import type { PinoteAuthor, PinoteAuthorPlacement } from "./types";

/** The default marker appearance, reusable with render and app-owned children. */
export const PinoteTrigger = forwardRef<HTMLButtonElement, PinoteTriggerProps>(
  function PinoteTrigger({ className, style, type = "button", ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        data-slot="pinote-trigger"
        className={`pn pn-t ${className ?? ""}`}
        style={{
          borderRadius: `var(--pinote-trigger-radius, ${pinoteRadius(props["data-orientation"] ?? "bottom-left", "50%")})`,
          ...style,
        }}
      />
    );
  },
);

type MarkerProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  author: PinoteAuthor | undefined;
  authorPlacement: PinoteAuthorPlacement;
  icon: ReactNode;
  triggerRef: RefObject<HTMLButtonElement | null>;
  render: PinoteRender | undefined;
  state: PinoteTriggerState;
};

/** Visual trigger only; behavior comes from the interaction controller. */
export function PinoteMarker({
  author,
  authorPlacement,
  icon,
  triggerRef,
  render,
  state,
  ...props
}: MarkerProps) {
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
  const hasAside = beside && author?.avatarUrl;
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
    <PinoteTrigger {...props} ref={triggerRef}>
      {hasAside && avatar}
      {hasAside ? <span className="pn-f">{mark}</span> : mark}
    </PinoteTrigger>
  );
}
