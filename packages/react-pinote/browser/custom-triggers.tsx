import { forwardRef, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import {
  Pinote,
  PinoteLayer,
  PinoteProvider,
  usePinoteProvider,
} from "../dist/index.js";

const AppButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>((props, ref) => <button {...props} ref={ref} />);

function ExternalControl() {
  const { open } = usePinoteProvider();
  return (
    <button onClick={() => open("custom-expand")}>
      Open custom from provider
    </button>
  );
}

export function CustomTriggers() {
  const ref = useRef<HTMLButtonElement>(null);
  const [clicks, setClicks] = useState(0);
  const [refReady, setRefReady] = useState(false);
  return (
    <PinoteProvider>
      <section aria-label="Custom triggers" style={{ margin: 40 }}>
        <ExternalControl />
        <Pinote
          id="custom-attachment"
          content={<input aria-label="Custom reply" />}
          preview={false}
          render={
            <AppButton
              ref={ref}
              onClick={(event) => {
                setClicks((value) => value + 1);
                setRefReady(ref.current === event.currentTarget);
              }}
              style={{
                width: 90,
                height: 36,
                borderRadius: 6,
                background: "#f8e5a4",
                color: "#45350e",
                border: "2px solid #45350e",
                fontSize: 14,
              }}
            >
              Discuss
            </AppButton>
          }
        >
          <p style={{ width: 180 }}>An attachment without a layer</p>
        </Pinote>
        <p data-testid="custom-actions">
          {clicks} custom actions; ref {refReady ? "ready" : "pending"}
        </p>
        <PinoteLayer data-testid="custom-layer" style={{ height: 140 }}>
          <Pinote
            id="custom-drag"
            defaultPosition={{ x: 30, y: 50 }}
            draggable
            preview={false}
            content="Custom drag content"
            render={
              <AppButton style={{ width: 80, height: 32 }}>
                Custom drag
              </AppButton>
            }
          />
        </PinoteLayer>
        <PinoteLayer style={{ height: 140 }}>
          <Pinote
            id="custom-expand"
            defaultPosition="center"
            variant="expand"
            preview={false}
            entranceAnimation="none"
            aria-label="Custom expansion"
            content={<input aria-label="Expansion reply" />}
            style={{ "--pinote-collapse-duration": "600ms" }}
            render={(props, state) => (
              <button
                {...props}
                style={{
                  width: 88,
                  height: 36,
                  borderRadius: 6,
                  ...props.style,
                }}
                data-testid="custom-expansion"
                data-preview={String(state.isPreview)}
              >
                Expand
              </button>
            )}
          />
        </PinoteLayer>
      </section>
    </PinoteProvider>
  );
}
