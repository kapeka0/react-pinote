import { Pinote, PinoteHighlight, PinoteLayer } from "react-pinote";

export default function Demo() {
  return (
    <PinoteLayer className="demo">
      <h1 className="wordmark" translate="no">
        react-
        <PinoteHighlight
          id="wordmark"
          aria-label="Open pinote about highlighted text"
          animation="slide"
          content="A thought attached to a word. The underline follows the text, even when it wraps."
        >
          pinote
        </PinoteHighlight>
      </h1>
      <Pinote
        id="quiet"
        aria-label="Open anonymous pinote"
        animation="fade"
        position={{ x: 25, y: 30 }}
        content="A little note, right here. No name needed."
      />
      <Pinote
        id="maya"
        author={{ name: "Maya", avatarUrl: "/maya.svg" }}
        position={{ x: 73, y: 32 }}
        content="I like this much breathing room. Let's keep it."
      />
      <Pinote
        id="spark"
        aria-label="Open custom icon pinote"
        position={{ x: 29, y: 70 }}
        animation="slide"
        icon={
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        }
        content="Your icon. Your little detail. Any React element can live here."
      />
      <Pinote
        id="custom"
        aria-label="Open custom style pinote"
        animation="none"
        position={{ x: 76, y: 66 }}
        style={{
          "--pinote-background": "#f8e5a4",
          "--pinote-foreground": "#45350e",
          "--pinote-trigger-radius": "9px",
          "--pinote-radius": "9px",
        }}
        content="A different color, a different shape. Still a pinote."
      />
    </PinoteLayer>
  );
}
