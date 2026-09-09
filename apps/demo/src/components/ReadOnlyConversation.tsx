import type { CSSProperties } from "react";
import { usePinote } from "react-pinote";
import type { PinoteAuthor } from "react-pinote";

// This data model and conversation UI belong to the demo, not to react-pinote.
export type DemoComment = { id: string; author: PinoteAuthor; text: string };

export function ConversationAvatars({ comments }: { comments: DemoComment[] }) {
  return (
    <span
      className="demo-avatar-stack"
      aria-hidden="true"
      style={{
        width: `calc(var(--pinote-size,25px) + ${Math.max(0, comments.length - 1) * 8}px)`,
      }}
    >
      {comments.map((comment, index) => (
        <img
          key={comment.id}
          className="pn-v"
          data-slot="pinote-avatar"
          src={comment.author.avatarUrl}
          alt=""
          title={comment.author.name}
          draggable={false}
          style={
            {
              left: index * 8,
              zIndex: comments.length - index,
              "--demo-avatar-reveal": `${index * 3}px`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export function ReadOnlyConversation({
  comments,
}: {
  comments: DemoComment[];
}) {
  const { isPreview } = usePinote();
  return (
    <div className="demo-conversation" data-preview={isPreview}>
      <p>{comments[0]?.text}</p>
      {isPreview ? (
        <span className="demo-conversation-count">
          {comments.length} comments
        </span>
      ) : (
        <ol aria-label="Replies">
          {comments.slice(1).map((comment) => (
            <li key={comment.id}>
              <div className="demo-comment-author">
                <img src={comment.author.avatarUrl} alt="" />
                <bdi>{comment.author.name}</bdi>
              </div>
              <p>{comment.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
