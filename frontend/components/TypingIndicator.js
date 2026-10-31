import styles from "./ChatPanel.module.css";

export default function TypingIndicator() {
  return (
    <div className={`${styles.row} ${styles.rowAssistant}`}>
      <span className={styles.avatar} aria-hidden="true">AI</span>
      <div className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.typing}`} role="status" aria-label="Assistant is typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
