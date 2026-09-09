import { useState } from "react";
import type { ReactNode } from "react";
import { PinoteSurface } from "./pinote-surface";
import { usePinoteInteraction } from "./use-pinote-interaction";
import { PinoteContentContext } from "./use-pinote";
import { usePinoteArea } from "./pinote-context";
import type {
  PinoteAppearance,
  PinoteDragOptions,
  PinotePlacement,
  PinotePosition,
} from "./types";

type AnnotationProps = PinoteAppearance &
  PinoteDragOptions & {
    position?: PinotePosition | PinotePlacement;
    defaultPosition?: PinotePosition | PinotePlacement;
    highlight?: boolean;
    children?: ReactNode;
  };

export function Annotation({
  position,
  defaultPosition = "top-right",
  draggable = false,
  onPositionChange,
  onDragEnd,
  highlight = false,
  children,
  ...appearance
}: AnnotationProps) {
  const attached = highlight || children != null;
  const [localPosition, setLocalPosition] = useState(defaultPosition);
  const anchor = position ?? localPosition;
  const point =
    typeof anchor === "string"
      ? {
          x: anchor.includes("left") ? 0 : anchor.includes("right") ? 100 : 50,
          y: anchor.includes("top") ? 0 : anchor.includes("bottom") ? 100 : 50,
        }
      : anchor;
  const interaction = usePinoteInteraction({
    ...appearance,
    expand: appearance.variant === "expand",
    draggable: draggable && !attached,
    position: point,
    onPositionChange: (next) => {
      if (position === undefined) setLocalPosition(next);
      onPositionChange?.(next);
    },
    onDragEnd,
  });
  usePinoteArea(attached);
  return (
    <PinoteContentContext.Provider value={interaction.state}>
      <PinoteSurface
        {...appearance}
        interaction={interaction}
        point={point}
        attached={attached}
        highlight={highlight}
        draggable={draggable && !attached}
      >
        {children}
      </PinoteSurface>
    </PinoteContentContext.Provider>
  );
}
