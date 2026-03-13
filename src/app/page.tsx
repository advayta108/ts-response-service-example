"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { role: "dispatcher" | "master" } | null;

export default function Home() {
  const [user, setUser] = useState<Me | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      const t = await r.text();
      try {
        const j = t ? JSON.parse(t) : {};
        if (!cancelled) setUser(j.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    const onAuth = () => {
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => r.text())
        .then((t) => {
          try {
            const j = t ? JSON.parse(t) : {};
            setUser(j.user ?? null);
          } catch {
            setUser(null);
          }
        });
    };
    window.addEventListener("auth-changed", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", onAuth);
    };
  }, []);

  const cabinetHref =
    user?.role === "dispatcher"
      ? "/dispatcher"
      : user?.role === "master"
        ? "/master"
        : "/login";

  return (
    <div className="space-y-6 py-6 sm:py-10">
      <h1 className="text-xl font-bold sm:text-2xl">
        Сервис заявок в ремонтную службу
      </h1>
      <p className="max-w-xl text-[var(--muted)]">
        {user
          ? "Оформите заявку или откройте свой кабинет."
          : "Оформите заявку или войдите для доступа к кабинету диспетчера или мастера."}
      </p>
      <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/request/new"
          className="inline-flex justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
        >
          Создать заявку
        </Link>
        {user === undefined ? (
          <span className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)]">
            …
          </span>
        ) : user ? (
          <Link
            href={cabinetHref}
            className="inline-flex justify-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-center text-sm font-medium hover:bg-[var(--nav)]"
          >
            Перейти в кабинет
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex justify-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-center text-sm hover:bg-[var(--nav)]"
          >
            Вход (диспетчер / мастер)
          </Link>
        )}
      </ul>
    </div>
  );
}
