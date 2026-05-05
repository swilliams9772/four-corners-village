import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LunarThemeBridge } from "@/components/theme/lunar-theme-bridge";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { AnalyticsIdentifier } from "@/components/analytics/analytics-identifier";
import { env } from "@/lib/env";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: env.app.name,
    template: `%s · ${env.app.name}`,
  },
  description:
    "A digital village for spiritual practitioners — sovereign sub-spaces, sacred technology, and the Vintage TV documentary library.",
  metadataBase: new URL(env.app.url),
  applicationName: env.app.name,
  openGraph: {
    type: "website",
    url: env.app.url,
    siteName: env.app.name,
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08081A" },
    { media: "(prefers-color-scheme: light)", color: "#FBF8F2" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <ThemeProvider defaultTheme="dark" storageKey="fc-theme">
          <Suspense fallback={null}>
            <PostHogProvider>
              <AnalyticsIdentifier />
              <LunarThemeBridge />
              {children}
              <Toaster richColors position="top-right" />
            </PostHogProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
