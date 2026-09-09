import { createContext, useContext } from "react";
import type { PinoteAnimation } from "./types";

export type PinoteContextValue = {
  openId: string | null;
  persistent: boolean;
  ready: boolean;
  animation: PinoteAnimation;
  portal: boolean;
  portalContainer: HTMLElement | null;
  close: () => void;
  open: (id: string) => void;
  dismissPreview: (id: string) => void;
  preview: (id: string) => void;
};

export const PinoteContext = createContext<PinoteContextValue | null>(null);
export const PinoteLayerContext = createContext(false);

export function usePinoteArea(attached: boolean) {
  const inLayer = useContext(PinoteLayerContext);
  if (!attached && !inLayer)
    throw new Error(
      "Render standalone Pinote components inside a PinoteLayer within a PinoteProvider.",
    );
}

export function usePinoteContext() {
  const context = useContext(PinoteContext);
  if (!context)
    throw new Error("Render Pinote components inside a PinoteProvider.");
  return context;
}
