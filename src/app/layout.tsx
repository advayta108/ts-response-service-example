import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Заявки — ремонтная служба",
  description: "Приём и обработка заявок",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <nav className="border-b border-white/10 bg-[var(--card)] px-4 py-3">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4">
            <Link href="/" className="font-semibold text-blue-400">
              Заявки
            </Link>
            <Link href="/request/new" className="text-sm hover:underline">
              Новая заявка
            </Link>
            <Link href="/login" className="text-sm hover:underline">
              Вход
            </Link>
            <Link href="/dispatcher" className="text-sm hover:underline">
              Диспетчер
            </Link>
            <Link href="/master" className="text-sm hover:underline">
              Мастер
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </body>
    </html>
  );
}
