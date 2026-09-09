import type { ComponentPropsWithoutRef } from "react";
import type { PinoteAppearance } from "./types";
import { PinoteLayerContext } from "./pinote-context";

export type PinoteLayerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "style"
> & {
  style?: PinoteAppearance["style"];
};

/** The coordinate area for standalone pinotes. State belongs to PinoteProvider. */
export function PinoteLayer({ className, ...props }: PinoteLayerProps) {
  return (
    <PinoteLayerContext.Provider value={true}>
      <div
        {...props}
        className={`pn-layer ${className ?? ""}`}
        data-slot="pinote-layer"
      />
    </PinoteLayerContext.Provider>
  );
}
