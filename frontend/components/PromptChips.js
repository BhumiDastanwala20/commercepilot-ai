import styles from "./ChatPanel.module.css";

export const SUGGESTED_PROMPTS = ["Do you have mugs?", "Can I get 12 for a discount?", "Gift ideas under $50"];

export default function PromptChips({ onPick, disabled }) {
  return (
    <div className={styles.chips} role="group" aria-label="Suggested questions">
      {SUGGESTED_PROMPTS.map((p) => (
        <button key={p} type="button" className={styles.chip} onClick={() => onPick(p)} disabled={disabled}>
          {p}
        </button>
      ))}
    </div>
  );
}
