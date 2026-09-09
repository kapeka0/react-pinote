import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import type { PinoteState } from "./use-pinote";

/** Native button props for PinoteTrigger and the render callback. */
export type PinoteTriggerProps = ComponentPropsWithRef<"button"> & {
  [key: `data-${string}`]: string | undefined;
};
export type PinoteTriggerState = PinoteState & { isDragging: boolean };
export type PinoteRender =
  | ReactElement
  | ((props: PinoteTriggerProps, state: PinoteTriggerState) => ReactElement);

/** Percentages of the layer's area, measured from the top-left corner. */
export type PinotePosition = { x: number; y: number };
/** Physical edges of the layer, attached component, or highlighted text. */
export type PinotePlacement =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";
export type PinoteAuthor = { name: string; avatarUrl?: string };
export type PinoteAuthorPlacement = "inside" | "beside";
export type PinoteAnimation = "fade" | "scale" | "slide" | "none";
export type PinoteColor = `#${string}`;
export type PinoteEntranceAnimation = "pop" | "none";
export type PinoteVariant = "popover" | "expand";
export type PinoteOrientation =
  "auto" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type PinoteAppearance = {
  /** Show a separate message, or expand from the marker's pointed corner. @default "popover" */
  variant?: PinoteVariant;
  /** Shared hexadecimal marker/message background. Omit for the neutral default. */
  color?: PinoteColor;
  /** Pointed corner. Auto points toward attachments and can flip an expansion to fit. @default "auto" */
  orientation?: PinoteOrientation;
  /** One-shot marker entrance, separate from the message animation. Respects reduced motion. @default "pop" */
  entranceAnimation?: PinoteEntranceAnimation;
  /** Preview on hover or keyboard focus. Explicit activation still opens the content. @default true */
  preview?: boolean;
  /** Reports outside pointer presses and focus leaving the trigger/content, including while closed. */
  onInteractOutside?: (event: PointerEvent | FocusEvent) => void;
  /** Message-opening animation; inherits the provider setting. */
  animation?: PinoteAnimation;
  /** Omit for an anonymous pinote with no user information. */
  author?: PinoteAuthor;
  /** Custom header, replacing the author's name. Pass null to omit it. */
  header?: ReactNode;
  /** Custom leading visual, replacing the content avatar. Pass null to omit it. */
  leading?: ReactNode;
  /** Optional custom focus target when explicitly opened. Hover never moves focus. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Place the supplied author avatar inside or beside the trigger. @default "inside" */
  authorPlacement?: PinoteAuthorPlacement;
  /** Message body. May contain interactive React content. */
  content: ReactNode;
  /** Optional trigger icon, replacing the inside avatar. Omit for an avatar or empty marker; null hides both. */
  icon?: ReactNode;
  /** Replace the entire trigger with an app-styled button. Children remain the annotation target. */
  render?: PinoteRender;
  /** Stable identifier, unique within this provider. */
  id: string;
  className?: string;
  style?: CSSProperties & {
    [key: `--pinote-${string}`]: string | number | undefined;
  };
  "aria-label"?: string;
};

export type PinoteDragOptions = {
  /** Enable pointer dragging on standalone pinotes. @default false */
  draggable?: boolean;
  /** Called with clamped layer percentages during movement (and rollback on cancellation). */
  onPositionChange?: (position: PinotePosition) => void;
  /** Called on release. Not called for clicks or cancelled drags. */
  onDragEnd?: (position: PinotePosition) => void;
};
