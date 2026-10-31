import Link from "next/link";
import HomeProducts from "@/components/HomeProducts";
import styles from "./page.module.css";

const STEPS = [
  { title: "Customer asks", text: "Shoppers chat in plain language. The AI searches your live catalog and answers instantly.", icon: "chat" },
  { title: "AI negotiates", text: "It haggles politely, but every price is checked by your rules in code. The AI never sets the final price.", icon: "shield" },
  { title: "PayPal checkout", text: "Once they agree, a PayPal order is created and a Pay button appears right in the chat.", icon: "card" },
  { title: "You watch it live", text: "Orders, approvals, and AI reasoning stream onto your dashboard in real time.", icon: "chart" },
];

const ICONS = {
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4" />,
  card: <path d="M3 7h18v10H3zM3 11h18M7 15h3" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div>
            <span className="badge badge-accent">
              <span className="dot" /> PayPal + Claude AI
            </span>
            <h1 className={styles.title}>
              Your 24/7 AI sales agent, <span className={styles.highlight}>with checkout built in.</span>
            </h1>
            <p className={styles.lead}>
              CommercePilot answers customers from your catalog, negotiates within the rules you set, and closes the sale with a
              secure PayPal checkout, right inside the chat.
            </p>
            <div className={styles.ctas}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Try the shop chat
              </Link>
              <Link href="/dashboard" className="btn btn-secondary btn-lg">
                Open owner dashboard
              </Link>
            </div>
            <ul className={styles.trust}>
              <li>Prices enforced by code, not the AI</li>
              <li>PayPal Orders v2</li>
              <li>Live owner dashboard</li>
            </ul>
          </div>

          <div className={`card ${styles.preview}`} aria-hidden="true">
            <div className={styles.previewHead}>
              <span className={styles.avatar}>AI</span>
              <div>
                <strong>Sales assistant</strong>
                <div className={styles.online}>
                  <span className="dot" /> Online
                </div>
              </div>
            </div>
            <div className={styles.previewBody}>
              <p className={`${styles.bubble} ${styles.user}`}>Can I get 12 mugs for a discount?</p>
              <p className={`${styles.bubble} ${styles.bot}`}>Great choice! For 12 mugs I can do $15.30 each, 15% off the list price.</p>
              <div className={styles.miniOrder}>
                <div className={styles.miniRow}>
                  <span>Ceramic Coffee Mug × 12</span>
                  <span>$183.60</span>
                </div>
                <div className={`${styles.miniRow} ${styles.saved}`}>
                  <span>Bulk discount</span>
                  <span>−$32.40</span>
                </div>
                <div className={styles.miniPay}>
                  Pay with <b>PayPal</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="how-title">
        <span className="eyebrow">How it works</span>
        <h2 id="how-title" className="section-title">
          From question to paid order in one conversation
        </h2>
        <p className="section-sub">The AI handles the conversation. Your rules decide the price. PayPal handles the money.</p>
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.title} className={`card ${styles.step}`}>
              <span className={styles.stepIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[s.icon]}
                </svg>
              </span>
              <span className={styles.stepNum}>Step {i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="products-title">
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">Catalog</span>
            <h2 id="products-title" className="section-title">
              Products the agent can sell
            </h2>
          </div>
          <Link href="/shop" className="btn btn-secondary">
            Chat to buy →
          </Link>
        </div>
        <HomeProducts />
      </section>

      <section className="container">
        <div className={styles.band}>
          <div>
            <h2>See it from the owner&apos;s side</h2>
            <p>Watch orders, approvals, and the AI&apos;s reasoning arrive live while you chat in another tab.</p>
          </div>
          <div className={styles.ctas}>
            <Link href="/dashboard" className={`btn btn-lg ${styles.bandBtn}`}>
              Open dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
