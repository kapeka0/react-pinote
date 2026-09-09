import { useEffect, useState } from "react";
import type { PinotePosition } from "react-pinote";
import { Pinote, PinoteHighlight, PinoteLayer } from "react-pinote";
import { OneTimePinote } from "./OneTimePinote";
import {
  ConversationAvatars,
  ReadOnlyConversation,
} from "./ReadOnlyConversation";

const POSITION_KEY = "react-pinote:demo-position:v1";

function savePosition(position: PinotePosition) {
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify(position));
  } catch {
    // Moving still works when storage is blocked or full.
  }
}

export default function Demo({
  kapekaAvatarUrl,
  codexAvatarUrl,
  claudeAvatarUrl,
  kimiAvatarUrl,
}: {
  kapekaAvatarUrl: string;
  codexAvatarUrl: string;
  claudeAvatarUrl: string;
  kimiAvatarUrl: string;
}) {
  const comments = [
    {
      id: "codex",
      author: { name: "Codex", avatarUrl: codexAvatarUrl },
      text: "We vibecoded this library. I wrote the code. They supervised.",
    },
    {
      id: "claude",
      author: { name: "Claude", avatarUrl: claudeAvatarUrl },
      text: "I asked for 2px more to the right. That's called art direction.",
    },
    {
      id: "kimi",
      author: { name: "Kimi", avatarUrl: kimiAvatarUrl },
      text: "I moved it 2px. Then 2px back. We should invoice by the pixel.",
    },
  ];
  // The server cannot read browser storage. Mount this marker only after its
  // saved coordinates are known, so the default spot is never painted first.
  const [position, setPosition] = useState<PinotePosition | null>(null);
  useEffect(() => {
    let initialPosition = { x: 25, y: 30 };
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(POSITION_KEY) ?? "null",
      );
      if (
        saved &&
        typeof saved === "object" &&
        "x" in saved &&
        "y" in saved &&
        typeof saved.x === "number" &&
        typeof saved.y === "number" &&
        Number.isFinite(saved.x) &&
        Number.isFinite(saved.y) &&
        saved.x >= 0 &&
        saved.x <= 100 &&
        saved.y >= 0 &&
        saved.y <= 100
      ) {
        initialPosition = { x: saved.x, y: saved.y };
      }
    } catch {
      // Invalid or unavailable storage falls back to the initial coordinates.
    }
    setPosition(initialPosition);
  }, []);
  return (
    <PinoteLayer className="demo">
      <div className="intro">
        <h1 className="wordmark" translate="no">
          react-
          <PinoteHighlight
            id="wordmark"
            aria-label="Open pinote about highlighted text"
            variant="expand"
            icon={null}
            content="A thought attached to a word."
          >
            pinote
          </PinoteHighlight>
        </h1>
        <p className="description">
          Lightweight annotations for your React UI.
        </p>
      </div>
      {position && (
        <Pinote
          id="quiet"
          aria-label="Open anonymous pinote"
          animation="fade"
          color="#1d4ed8"
          orientation="bottom-right"
          icon={null}
          draggable
          position={position}
          onPositionChange={setPosition}
          onDragEnd={savePosition}
          content="No name needed. Drag me around. I'll remember this spot."
        />
      )}
      <Pinote
        id="kapeka"
        variant="expand"
        author={{ name: "Kapeka", avatarUrl: kapekaAvatarUrl }}
        draggable
        defaultPosition={{ x: 61, y: 32 }}
        content="Minimalist? We just ran out of tokens."
      />
      <OneTimePinote
        id="spark"
        aria-label="Open one-time pinote"
        draggable
        defaultPosition={{ x: 29, y: 70 }}
        animation="slide"
        color="#b91c1c"
        orientation="top-right"
        icon={null}
        content="A one-time pinote. Click outside or move focus away, and I'll disappear."
      />
      <Pinote
        id="custom"
        aria-label="Open custom style pinote"
        animation="none"
        icon={null}
        draggable
        defaultPosition={{ x: 76, y: 66 }}
        style={{
          "--pinote-background": "#f8e5a4",
          "--pinote-foreground": "#45350e",
          "--pinote-trigger-radius": "9px",
          "--pinote-radius": "9px",
        }}
        content="A different color, a different shape. Still a pinote."
      />
      <Pinote
        id="side-author"
        aria-label="Open pinote with a side author"
        author={comments[0]!.author}
        authorPlacement="beside"
        triggerAside={<ConversationAvatars comments={comments} />}
        draggable
        defaultPosition={{ x: 52, y: 72 }}
        orientation="top-left"
        icon={null}
        content={<ReadOnlyConversation comments={comments} />}
      />
    </PinoteLayer>
  );
}
