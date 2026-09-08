import type { ReactNode } from "react";
import { Annotation } from "./annotation";
import type {
  PinoteAppearance,
  PinotePlacement,
  PinotePosition,
} from "./types";

export type PinoteHighlightProps = PinoteAppearance & {
  children: ReactNode;
  position?: PinotePosition | PinotePlacement;
};

export function PinoteHighlight(props: PinoteHighlightProps) {
  return <Annotation {...props} highlight />;
}
