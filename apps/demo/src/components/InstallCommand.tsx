import { useEffect, useRef, useState } from "react";

const command = "npm i react-pinote";

export function InstallCommand() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      clearTimeout(resetTimer.current);
      setStatus("copied");
      resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      clearTimeout(resetTimer.current);
      setStatus("error");
    }
  }

  return (
    <div className="install-command">
      <pre>
        <code>{command}</code>
      </pre>
      <button
        className="copy-command"
        type="button"
        aria-label="Copy install command"
        data-copied={status === "copied"}
        onClick={copyCommand}
      >
        <span className="copy-clipboard" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
            <rect x="9" y="2" width="6" height="4" rx="1" />
          </svg>
        </span>
        <span className="copy-check" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
      </button>
      <span
        role="status"
        className={status === "error" ? "copy-error" : "sr-only"}
      >
        {status === "copied"
          ? "Copied to clipboard."
          : status === "error"
            ? "Couldn't copy. Select the command and copy it manually."
            : ""}
      </span>
    </div>
  );
}
