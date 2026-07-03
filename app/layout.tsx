import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { PointerEventsGuard } from "@/components/pointer-events-guard";
import { BackgroundGlow } from "@/components/background-glow";
import "./globals.css";

// Named --font-sans (not --font-lato) so it lines up with the `--font-sans:
// var(--font-sans)` passthrough in globals.css's @theme inline block — the
// original Geist scaffold used --font-geist-sans there, which meant
// `font-sans` utilities were silently falling back to Tailwind's default
// stack instead of the loaded font.
const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "OS — Ledger",
  description: "Track every rupee that moves — expenses, income, and transfers.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OS",
  },
};

export const viewport: Viewport = {
  themeColor: "#12141a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BackgroundGlow />
        {children}
        <Toaster richColors position="top-center" />
        <RegisterServiceWorker />
        <PointerEventsGuard />
      </body>
    </html>
  );
}
