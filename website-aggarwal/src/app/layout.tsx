import { Bodoni_Moda, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const vibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vibes",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aggarwalsweets.web.app"),
  title: "The Bake Story by Aggarwal's | Freshly Baked Everyday",
  description:
    "The Bake Story by Aggarwal's — freshly baked cakes, sweets, and confectionery.",
  openGraph: {
    title: "The Bake Story by Aggarwal's",
    description: "Freshly baked everyday.",
    images: [{ url: "/images/logo.svg" }],
  },
  icons: {
    icon: [{ url: "/images/favicon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${bodoni.variable} ${manrope.variable} ${vibes.variable} antialiased`}>
        {/*
          THESIS: The first viewport is the bakery’s own photography, not a dark restaurant splash.
          OWN-WORLD: White paper, chocolate brown, thin Didone display, script flourish, hairline chrome.
          STORY: A visitor lands on The Bake Story and immediately sees the day’s banner, then the menu.
          FIRST VIEWPORT: Slim brown bar, white nav with the admin mark centered, then a full-bleed banner hero.
          FORM: White confectionery salon; FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <Providers>
          <Navbar />
          <main className="pt-[var(--header-height)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
