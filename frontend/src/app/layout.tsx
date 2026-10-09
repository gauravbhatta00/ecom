import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5173" : "http://localhost:3000")),
  title: { default: "LeloVaiLelo — Clothing for your everyday", template: "%s | LeloVaiLelo" },
  description: "Everyday clothing with personality. Discover shirts, denim, knitwear, outerwear, dresses, and matching sets.",
  openGraph: { type: "website", siteName: "LeloVaiLelo", title: "LeloVaiLelo — Clothing for your everyday", description: "Considered clothing for your everyday wardrobe.", images: [{ url: "/images/fashion/studio.jpg", width: 1000, height: 1500, alt: "A considered clothing collection" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
