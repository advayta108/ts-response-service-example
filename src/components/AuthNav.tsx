"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Me = { id: number; name: string; role: "dispatcher" | "master" };

export function AuthNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/auth/me", { credentials: "include" });
    const t = await r.text();
    try {
      const j = t ? JSON.parse(t) : {};
      setUser(j.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onAuth = () => refresh();
    window.addEventListener("auth-changed", onAuth);
    return () => window.removeEventListener("auth-changed", onAuth);
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.refresh();
    router.push("/");
  }

  if (user === undefined) {
    return (
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <span className="text-sm text-[var(--muted)]">…</span>
      </div>
    );
  }

  const authed = user !== null;
  const cabinetHref =
    user?.role === "dispatcher"
      ? "/dispatcher"
      : user?.role === "master"
        ? "/master"
        : "/login";

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <Link
        href="/request/new"
        className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]"
      >
        Создать заявку
      </Link>
      {authed && (
        <Link
          href={cabinetHref}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Перейти в кабинет
        </Link>
      )}
      {!authed && (
        <>
          <Link
            href="/login"
            className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]"
          >
            Вход
          </Link>
          <Link
            href="/dispatcher"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Диспетчер
          </Link>
          <Link
            href="/master"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Мастер
          </Link>
        </>
      )}
      {authed && (
        <button
          type="button"
          onClick={logout}
          className="text-sm text-[var(--foreground)] hover:text-red-600 dark:hover:text-red-400"
        >
          Выход ({user.name})
        </button>
      )}
    </div>
  );
}
