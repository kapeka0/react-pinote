import { createContext, useContext } from "react";
import { usePinoteContext } from "./pinote-context";

export type PinoteState = {
  id: string;
  isOpen: boolean;
  isPreview: boolean;
  open: () => void;
  close: () => void;
};

export const PinoteContentContext = createContext<PinoteState | null>(null);

/** Read and control the containing pinote from any content or visual slot, including portals. */
export function usePinote() {
  const state = useContext(PinoteContentContext);
  if (!state) throw new Error("Use usePinote inside a Pinote.");
  return state;
}

/** Open or close a pinote from an app-owned toolbar inside its layer. */
export function usePinoteLayer() {
  const { openId, open, close } = usePinoteContext();
  return { openId, open, close };
}
