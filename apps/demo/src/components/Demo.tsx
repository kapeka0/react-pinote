import { useEffect, useState } from "react";
import type { PinotePosition } from "react-pinote";
import { Pinote, PinoteHighlight, PinoteLayer } from "react-pinote";
import { OneTimePinote } from "./OneTimePinote";
import { InstallCommand } from "./InstallCommand";
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
        <InstallCommand />
      </div>
      <footer className="demo-footer">
        <a
          href="https://github.com/kapeka0/react-pinote"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.128-1.554-.385-.207-.935-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.664 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.431 0-1.197.426-2.187 1.128-2.957-.11-.275-.495-1.402.11-2.915 0 0 .921-.288 3.025 1.128a10.193 10.193 0 0 1 2.75-.371c.935 0 1.87.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.22 2.64.11 2.915.701.77 1.128 1.747 1.128 2.957 0 4.221-2.571 5.156-5.019 5.431.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z" />
          </svg>
          GitHub
        </a>
      </footer>
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
