import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PinoteContext } from "./pinote-context";
import type { PinoteAnimation } from "./types";

export type PinoteProviderProps = {
  children: ReactNode;
  defaultOpenId?: string;
  onOpenChange?: (id: string | null) => void;
  openId?: string | null;
  animation?: PinoteAnimation;
  portal?: boolean;
  portalContainer?: HTMLElement | null;
};

export function PinoteProvider({
  children,
  defaultOpenId,
  onOpenChange,
  openId: controlledId,
  animation = "scale",
  portal = true,
  portalContainer = null,
}: PinoteProviderProps) {
  const [state, setState] = useState({
    id: defaultOpenId ?? null,
    persistent: !!defaultOpenId,
  });
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const openId = controlledId === undefined ? state.id : controlledId;
  // Externally opened IDs are persistent. Rejected requests must never leave
  // persistence attached to a different visible ID.
  const persistent =
    openId !== null && (openId !== state.id || state.persistent);
  const request = (id: string | null, persist = false) => {
    setState({ id, persistent: persist });
    if (id !== openId) onOpenChange?.(id);
  };

  return (
    <PinoteContext.Provider
      value={{
        openId,
        persistent,
        ready,
        animation,
        portal,
        portalContainer,
        close: () => request(null),
        open: (id) => request(id, true),
        preview: (id) => {
          if (!persistent) request(id);
        },
        dismissPreview: (id) => {
          if (openId === id && !persistent) request(null);
        },
      }}
    >
      {children}
    </PinoteContext.Provider>
  );
}
