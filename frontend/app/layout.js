import "./globals.css";

export const metadata = {
  title: "CommercePilot AI",
  description: "AI sales agent with PayPal checkout",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}