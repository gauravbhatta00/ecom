import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5173" : "http://localhost:3000")),
  title: { default: "LeloVaiLelo — Good finds, daily", template: "%s | LeloVaiLelo" },
  description: "Thoughtfully chosen essentials for a considered everyday. Discover useful, beautiful pieces at LeloVaiLelo.",
  openGraph: { type: "website", siteName: "LeloVaiLelo", title: "LeloVaiLelo — Good finds, daily", description: "Thoughtfully chosen essentials for a considered everyday.", images: [{ url: "/images/everyday-editorial.png", width: 1536, height: 1024, alt: "A collection of everyday essentials" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
