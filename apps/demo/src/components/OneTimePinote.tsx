import { useEffect, useRef, useState } from "react";
import { Pinote, usePinoteLayer } from "react-pinote";
import type { PinoteProps } from "react-pinote";

/** This demo decides when an annotation is consumed; the library only reports interactions. */
export function OneTimePinote(props: PinoteProps) {
  const { openId, close } = usePinoteLayer();
  const viewed = useRef(false);
  const [consumed, setConsumed] = useState(false);
  useEffect(() => {
    if (openId === props.id) viewed.current = true;
  }, [openId, props.id]);
  return consumed ? null : (
    <Pinote
      {...props}
      preview={false}
      onInteractOutside={(event) => {
        if (!viewed.current) return;
        if (event.type === "focusout" && openId === props.id) close();
        setConsumed(true);
      }}
    />
  );
}
