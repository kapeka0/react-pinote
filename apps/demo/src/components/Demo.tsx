import { useEffect, useState } from "react";
import type { PinotePosition } from "react-pinote";
import {
  Pinote,
  PinoteHighlight,
  PinoteLayer,
  PinoteProvider,
} from "react-pinote";
import { OneTimePinote } from "./OneTimePinote";
import { InstallCommand } from "./InstallCommand";
import {
  ConversationTrigger,
  ReadOnlyConversation,
} from "./ReadOnlyConversation";

const POSITION_KEY = "react-pinote:demo-position:v1";
const DEFAULT_POSITIONS = {
  quiet: { x: 25, y: 30 },
  kapeka: { x: 61, y: 32 },
  spark: { x: 29, y: 70 },
  custom: { x: 76, y: 66 },
  "side-author": { x: 52, y: 72 },
};
type MarkerId = keyof typeof DEFAULT_POSITIONS;

function positionKey(id: MarkerId) {
  // Preserve the blue marker's existing saved position.
  return id === "quiet" ? POSITION_KEY : `${POSITION_KEY}:${id}`;
}

function loadPosition(id: MarkerId): PinotePosition {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(positionKey(id)) ?? "null",
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
      return { x: saved.x, y: saved.y };
    }
  } catch {
    // Invalid or unavailable storage only resets this marker.
  }
  return DEFAULT_POSITIONS[id];
}

function savePosition(id: MarkerId, position: PinotePosition) {
  try {
    localStorage.setItem(positionKey(id), JSON.stringify(position));
  } catch {
    // Moving still works when storage is blocked or full.
  }
}

export default function Demo({
  kapekaAvatarUrl,
  photoUrl,
  codexAvatarUrl,
  claudeAvatarUrl,
  kimiAvatarUrl,
}: {
  kapekaAvatarUrl: string;
  photoUrl: string;
  codexAvatarUrl: string;
  claudeAvatarUrl: string;
  kimiAvatarUrl: string;
}) {
  const comments = [
    {
      id: "codex",
      author: { name: "Codex", avatarUrl: codexAvatarUrl },
      text: "I found the last bug.",
    },
    {
      id: "claude",
      author: { name: "Claude", avatarUrl: claudeAvatarUrl },
      text: "Fixed it.",
    },
    {
      id: "kimi",
      author: { name: "Kimi", avatarUrl: kimiAvatarUrl },
      text: "I found the next last bug.",
    },
  ];
  // Mount markers after reading storage, so their default spots never flash.
  const [positions, setPositions] = useState<Record<
    MarkerId,
    PinotePosition
  > | null>(null);
  useEffect(() => {
    const initialPositions = { ...DEFAULT_POSITIONS };
    for (const id of Object.keys(initialPositions) as MarkerId[]) {
      initialPositions[id] = loadPosition(id);
    }
    setPositions(initialPositions);
  }, []);
  return (
    <PinoteProvider>
      <PinoteLayer className="demo">
        <div className="intro">
          <h1 className="wordmark" translate="no">
            react-
            <PinoteHighlight
              id="wordmark"
              aria-label="Open pinote about highlighted text"
              variant="expand"
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
        {positions && (
          <>
            <Pinote
              id="quiet"
              aria-label="Open anonymous pinote"
              animation="fade"
              color="#1d4ed8"
              orientation="bottom-right"
              draggable
              defaultPosition={positions.quiet}
              onDragEnd={(position) => savePosition("quiet", position)}
              content="No name needed. Drag me around. I'll remember this spot."
            />
            <Pinote
              id="kapeka"
              variant="expand"
              author={{ name: "Kapeka", avatarUrl: kapekaAvatarUrl }}
              draggable
              defaultPosition={positions.kapeka}
              onDragEnd={(position) => savePosition("kapeka", position)}
              content="Minimalist? We just ran out of tokens."
            />
            <OneTimePinote
              id="spark"
              aria-label="Open one-time pinote"
              draggable
              defaultPosition={positions.spark}
              onDragEnd={(position) => savePosition("spark", position)}
              animation="slide"
              color="#b91c1c"
              orientation="top-right"
              content="A one-time pinote. Click outside or move focus away, and I'll disappear."
            />
            <Pinote
              id="custom"
              className="photo-pinote"
              aria-label="Open custom style pinote"
              animation="slide"
              draggable
              defaultPosition={positions.custom}
              onDragEnd={(position) => savePosition("custom", position)}
              render={<button type="button" className="photo-trigger" />}
              style={{
                "--pinote-background": "#f8e5a4",
                "--pinote-foreground": "#45350e",
                "--pinote-radius": "9px",
              }}
              content={
                <figure className="demo-photo">
                  <img
                    src={photoUrl}
                    alt="Sunlight casting window shadows on a golden curtain."
                    width="248"
                    height="186"
                    decoding="async"
                    draggable={false}
                  />
                  <figcaption>Afternoon light.</figcaption>
                </figure>
              }
            />
            <Pinote
              id="side-author"
              aria-label="Open pinote with a side author"
              author={comments[0]!.author}
              render={<ConversationTrigger comments={comments} />}
              draggable
              defaultPosition={positions["side-author"]}
              onDragEnd={(position) => savePosition("side-author", position)}
              orientation="top-left"
              content={<ReadOnlyConversation comments={comments} />}
            />
          </>
        )}
      </PinoteLayer>
    </PinoteProvider>
  );
}
