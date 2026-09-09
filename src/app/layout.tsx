import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeSync, themeBootScript } from "@/components/shell/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auremont Bank",
  description:
    "Auremont Bank — private banking, cards and payments in one considered account.",
  applicationName: "Auremont Bank",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1a2c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
