// Generated product artwork: a gradient tile plus a simple line icon per product,
// so the catalog looks designed without any image files.

const PALETTES = {
  Kitchen: ["#fde68a", "#f59e0b"],
  Stationery: ["#fecaca", "#b45309"],
  Accessories: ["#d9f99d", "#65a30d"],
  Home: ["#e9d5ff", "#9333ea"],
  Desk: ["#fed7aa", "#c2410c"],
  Tech: ["#bae6fd", "#0369a1"],
  Gifts: ["#fbcfe8", "#db2777"],
};
const FALLBACK = ["#c7d2fe", "#4f46e5"];

const ICONS = {
  mug: (
    <>
      <path d="M22 26h28v22a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V26z" />
      <path d="M50 31h4a6 6 0 0 1 0 12h-4" />
      <path d="M30 16c0 3 3 3 3 6M38 14c0 3 3 3 3 6" />
    </>
  ),
  notebook: (
    <>
      <rect x="20" y="12" width="28" height="40" rx="3" />
      <path d="M26 12v40M32 22h10M32 28h10" />
      <path d="M48 20h3v8h-3" />
    </>
  ),
  tote: (
    <>
      <path d="M16 26h32l-3 28H19l-3-28z" />
      <path d="M24 26v-4a8 8 0 0 1 16 0v4" />
    </>
  ),
  candle: (
    <>
      <rect x="22" y="28" width="20" height="26" rx="3" />
      <path d="M32 28v-5" />
      <path d="M32 11c4 5 4 8 0 11-4-3-4-6 0-11z" />
      <path d="M22 36h20" />
    </>
  ),
  organizer: (
    <>
      <path d="M12 30h40v22H12z" />
      <path d="M24 30V18h16v12M28 30V24M36 30V24M24 52V30M40 52V30" />
    </>
  ),
  stand: (
    <>
      <rect x="22" y="10" width="20" height="34" rx="3" transform="rotate(-12 32 27)" />
      <path d="M18 54h28M24 54l8-12 8 12" />
    </>
  ),
  charger: (
    <>
      <circle cx="32" cy="34" r="18" />
      <path d="M34 22l-7 13h7l-3 11 8-14h-7l2-10z" />
    </>
  ),
  giftbox: (
    <>
      <rect x="14" y="26" width="36" height="26" rx="2" />
      <path d="M12 20h40v6H12zM32 20v32" />
      <path d="M32 20c-3-6-12-8-12-2 0 3 6 2 12 2zM32 20c3-6 12-8 12-2 0 3-6 2-12 2z" />
    </>
  ),
  default: (
    <>
      <path d="M18 24h28l-2 28H20l-2-28z" />
      <path d="M26 24v-3a6 6 0 0 1 12 0v3" />
    </>
  ),
};

export default function ProductArt({ product, size = "md" }) {
  const [light, dark] = PALETTES[product.category] || FALLBACK;
  const gid = `pa-${product.id}`;
  return (
    <div className={`product-art product-art-${size}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill={`url(#${gid})`} />
        <circle cx="52" cy="10" r="14" fill="#fff" opacity="0.18" />
        <circle cx="6" cy="60" r="12" fill="#fff" opacity="0.12" />
      </svg>
      <svg className="product-art-icon" viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[product.id] || ICONS.default}
      </svg>
    </div>
  );
}
