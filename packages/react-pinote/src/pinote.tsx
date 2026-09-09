import { Annotation } from "./annotation";
import type { ReactNode } from "react";
import type {
  PinoteAppearance,
  PinoteDragOptions,
  PinotePlacement,
  PinotePosition,
} from "./types";

export type PinoteProps = PinoteAppearance &
  (
    | {
        children: ReactNode;
        position?: PinotePosition | PinotePlacement;
        draggable?: false;
      }
    | (PinoteDragOptions & { children?: never } & (
          | {
              /** Controlled position; pair with onPositionChange when draggable. */ position:
                PinotePosition | PinotePlacement;
              defaultPosition?: never;
            }
          | {
              position?: never;
              /** Initial, internally managed position. */ defaultPosition:
                PinotePosition | PinotePlacement;
            }
        ))
  );

export function Pinote(props: PinoteProps) {
  return <Annotation {...props} />;
}
