import OrderSummaryCard from "./OrderSummaryCard";
import styles from "./ChatPanel.module.css";

const timeFmt = (at) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Renders **bold** from the model's replies without pulling in a markdown library.
function RichText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

export default function ChatMessage({ message, onRetry, retryDisabled }) {
  const { role, content, at, order } = message;

  if (role === "error") {
    return (
      <div className={`${styles.row} ${styles.rowAssistant}`}>
        <span className={`${styles.avatar} ${styles.avatarError}`} aria-hidden="true">!</span>
        <div className={`${styles.bubble} ${styles.bubbleError}`} role="alert">
          <p>{content}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} disabled={retryDisabled}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isUser = role === "user";
  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      {!isUser && (
        <span className={styles.avatar} aria-hidden="true">
          AI
        </span>
      )}
      <div className={styles.stack}>
        <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
          <span className="sr-only">{isUser ? "You said: " : "Assistant said: "}</span>
          <RichText text={content} />
        </div>
        {order && <OrderSummaryCard initialOrder={order} />}
        {at && (
          <time className={styles.time} dateTime={new Date(at).toISOString()}>
            {timeFmt(at)}
          </time>
        )}
      </div>
    </div>
  );
}
