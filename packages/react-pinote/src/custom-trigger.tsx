import { cloneElement, useMemo, version } from "react";
import type { ReactElement, Ref, RefObject, SyntheticEvent } from "react";
import type { PinoteTriggerProps } from "./types";

/** Compose the element's handlers and ref without taking ownership of its appearance. */
export function CustomTrigger({
  element,
  triggerProps,
  triggerRef,
}: {
  element: ReactElement;
  triggerProps: PinoteTriggerProps;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const custom = element.props as PinoteTriggerProps;
  // React 18 stores ref on the element; React 19 exposes it as a prop.
  const customRef = version.startsWith("18.")
    ? (element as unknown as { ref?: Ref<HTMLButtonElement> }).ref
    : custom.ref;
  const ref = useMemo(() => {
    let cleanup: void | (() => void);
    return (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (!node && cleanup) {
        cleanup();
        cleanup = undefined;
      } else if (typeof customRef === "function") cleanup = customRef(node);
      else if (customRef) customRef.current = node;
    };
  }, [customRef, triggerRef]);
  const props: PinoteTriggerProps = {
    ...triggerProps,
    ...custom,
    ref,
    className: `${triggerProps.className} ${custom.className ?? ""}`,
    style: { ...custom.style, ...triggerProps.style },
    "aria-controls": triggerProps["aria-controls"],
    "aria-expanded": triggerProps["aria-expanded"],
    "aria-haspopup": "dialog",
    "data-slot": "pinote-trigger",
    "data-state": triggerProps["data-state"],
  };
  for (const [key, handler] of Object.entries(triggerProps)) {
    const ownHandler = custom[key as keyof PinoteTriggerProps];
    if (
      /^on[A-Z]/.test(key) &&
      typeof handler === "function" &&
      typeof ownHandler === "function"
    ) {
      (props as Record<string, unknown>)[key] = (
        event: SyntheticEvent<HTMLButtonElement>,
      ) => {
        (ownHandler as (event: SyntheticEvent<HTMLButtonElement>) => void)(
          event,
        );
        if (!event.defaultPrevented) handler(event);
      };
    }
  }
  return cloneElement(element, props);
}
