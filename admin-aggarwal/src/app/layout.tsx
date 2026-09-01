import type { Metadata } from "next";
import { Cinzel, Inter, Playfair_Display } from "next/font/google";
import { AdminShell } from "@/components/AdminShell";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "The Bake Story - Admin",
  description: "Admin panel for The Bake Story",
  icons: {
    icon: [{ url: "/images/favicon.svg", type: "image/svg+xml" }],
    apple: "/images/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cinzel.variable} font-[family-name:var(--font-inter)] antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <AdminShell>{children}</AdminShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
