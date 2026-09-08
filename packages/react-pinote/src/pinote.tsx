import { Annotation } from "./annotation";
import type { ReactNode } from "react";
import type {
  PinoteAppearance,
  PinotePlacement,
  PinotePosition,
} from "./types";

export type PinoteProps = PinoteAppearance &
  (
    | { children: ReactNode; position?: PinotePosition | PinotePlacement }
    | { children?: never; position: PinotePosition | PinotePlacement }
  );

export function Pinote(props: PinoteProps) {
  return <Annotation {...props} />;
}
