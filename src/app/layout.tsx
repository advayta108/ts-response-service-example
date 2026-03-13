import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { RegisterPWA } from "@/components/RegisterPWA";

const metadataBase =
  process.env.VERCEL_URL != null
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Repair requests — service",
    template: "%s | Requests",
  },
  description: "Accept and dispatch repair service requests (dispatcher / master)",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Requests",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <RegisterPWA />
        <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--nav)]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-3 sm:px-4">
            <Link
              href="/"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Сервис заявок
            </Link>
            <AuthNav />
          </div>
        </nav>
        <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
