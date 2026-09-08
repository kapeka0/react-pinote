import type { CSSProperties, ReactNode } from "react";

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
export type PinoteAnimation = "fade" | "scale" | "slide" | "none";

export type PinoteAppearance = {
  animation?: PinoteAnimation;
  author?: PinoteAuthor;
  content: ReactNode;
  icon?: ReactNode;
  id: string;
  className?: string;
  style?: CSSProperties & {
    [key: `--pinote-${string}`]: string | number | undefined;
  };
  "aria-label"?: string;
};
