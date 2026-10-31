import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import styles from "./SiteHeader.module.css";

export function Logo() {
  return (
    <span className={styles.logoMark} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-8-8 18-2-8-8-2z" />
      </svg>
    </span>
  );
}

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="CommercePilot AI home">
          <Logo />
          <span>
            CommercePilot <span className={styles.ai}>AI</span>
          </span>
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <Link href="/shop" className={styles.link}>
            Shop
          </Link>
          <Link href="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
