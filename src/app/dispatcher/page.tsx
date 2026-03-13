"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { STATUS_RU } from "@/lib/toastMessages";

type Row = {
  id: number;
  clientName: string;
  phone: string;
  address: string;
  problemText: string;
  status: string;
  assignedTo: number | null;
};

type Master = { id: number; name: string };

type Toast = { id: string; text: string };

async function safeJson<T>(
  r: Response
): Promise<T | { error?: string } | null> {
  const t = await r.text();
  if (!t?.trim()) return null;
  try {
    return JSON.parse(t) as T;
  } catch {
    return { error: "Некорректный ответ сервера" };
  }
}

const fetchOpts: RequestInit = {
  credentials: "include",
  cache: "no-store",
};

function statusLabel(status: string) {
  return STATUS_RU[status] ?? status;
}

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const intl =
    digits.length === 11 && digits.startsWith("8")
      ? `7${digits.slice(1)}`
      : digits.length === 11 && digits.startsWith("7")
        ? digits
        : digits.length === 10
          ? `7${digits}`
          : digits;
  return `tel:+${intl}`;
}

function yandexMapsSearchUrl(query: string) {
  const q = query.trim();
  if (!q) return null;
  return `https://yandex.com/maps/?text=${encodeURIComponent(q)}`;
}

export default function DispatcherPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  /** Полный список (всегда без фильтра API) — история и снимок для «Все заявки» */
  const [allRequests, setAllRequests] = useState<Row[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  /** Фильтр только для карточки «Все заявки» */
  const [listFilter, setListFilter] = useState("");
  /** Фильтр только для «История заявок» (независимый) */
  const [historyFilter, setHistoryFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const refreshListRef = useRef<() => Promise<void>>(async () => {});

  const lastToastRef = useRef<{ text: string; at: number } | null>(null);
  const pushToast = useCallback((text: string) => {
    const now = Date.now();
    const last = lastToastRef.current;
    if (last && last.text === text && now - last.at < 1500) return;
    lastToastRef.current = { text, at: now };
    const id = `t-${++toastId.current}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 12000);
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/me", { ...fetchOpts });
      const j = (await safeJson<{ user?: { role: string } }>(r)) ?? {};
      const role = "user" in j ? j.user?.role : undefined;
      if (role !== "dispatcher") {
        window.location.href = `/login?next=${encodeURIComponent("/dispatcher")}`;
        return;
      }
      setAllowed(true);
    })();
  }, []);

  const loadAll = useCallback(async () => {
    if (!allowed) return;
    setMsg("");
    const r = await fetch(`/api/requests?_t=${Date.now()}`, fetchOpts);
    const data = await safeJson<Row[]>(r);
    if (!Array.isArray(data)) {
      setMsg(
        (data as { error?: string })?.error ??
          (r.ok ? "Пустой ответ" : `Ошибка ${r.status}`)
      );
      setAllRequests([]);
      return;
    }
    setAllRequests(data);
  }, [allowed]);

  const refreshFullList = useCallback(async () => {
    if (!allowed) return;
    setListFilter("");
    setMsg("");
    await loadAll();
  }, [allowed, loadAll]);

  const mainList = useMemo(() => {
    if (!listFilter) return allRequests;
    return allRequests.filter((r) => r.status === listFilter);
  }, [allRequests, listFilter]);

  const historyRows = useMemo(() => {
    let rows = allRequests.filter(
      (r) => r.status === "done" || r.status === "canceled"
    );
    if (historyFilter === "done")
      rows = rows.filter((r) => r.status === "done");
    else if (historyFilter === "canceled")
      rows = rows.filter((r) => r.status === "canceled");
    return rows.sort((a, b) => b.id - a.id).slice(0, 120);
  }, [allRequests, historyFilter]);

  const masterName = useCallback(
    (assignedTo: number | null) => {
      if (assignedTo == null) return "—";
      return (
        masters.find((m) => m.id === assignedTo)?.name ?? `id${assignedTo}`
      );
    },
    [masters]
  );

  useEffect(() => {
    refreshListRef.current = loadAll;
  }, [loadAll]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const r = await fetch("/api/users/masters", fetchOpts);
      const data = await safeJson<Master[]>(r);
      if (Array.isArray(data)) setMasters(data);
    })();
  }, [allowed]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (allowed !== true) return;
    const es = new EventSource("/api/events/stream", { withCredentials: true });
    es.onmessage = (ev) => {
      const raw = ev.data?.trim() ?? "";
      if (!raw.startsWith("{")) return;
      try {
        const p = JSON.parse(raw) as { type?: string; message?: string };
        if (p.type === "dispatcher_toast" && p.message) {
          pushToast(p.message);
          void refreshListRef.current();
        }
      } catch {
        /* ignore */
      }
    };
    const t = setInterval(() => void loadAll(), 8000);
    return () => {
      es.close();
      clearInterval(t);
    };
  }, [allowed, pushToast, loadAll]);

  async function assign(id: number, masterId: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", masterId }),
    });
    const j = (await safeJson(r)) as { error?: string; toast?: string };
    if (!r.ok) {
      if (r.status === 401)
        window.location.href = `/login?next=${encodeURIComponent("/dispatcher")}`;
      else setMsg(j?.error ?? "Ошибка");
      return;
    }
    await refreshFullList();
  }

  async function cancel(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const j = (await safeJson(r)) as { error?: string; toast?: string };
    if (!r.ok) {
      if (r.status === 401)
        window.location.href = `/login?next=${encodeURIComponent("/dispatcher")}`;
      else setMsg(j?.error ?? "Ошибка");
      return;
    }
    await refreshFullList();
  }

  if (allowed !== true) {
    return (
      <div className="space-y-3 py-8 text-center text-[var(--muted)]">
        <p>Проверка доступа…</p>
        <p className="text-sm">
          Панель диспетчера только после входа.{" "}
          <Link
            href="/login?next=%2Fdispatcher"
            className="text-[var(--accent)] underline"
          >
            Войти как диспетчер
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pb-28 py-4 sm:py-6">
      <p className="text-xs text-[var(--muted)]">
        Уведомления по SSE. «Все заявки» и «История» — отдельные фильтры; смена
        фильтра списка не трогает историю.
      </p>
      <h1 className="text-lg font-bold sm:text-xl">Панель диспетчера</h1>

      <details
        className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/50"
        open
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          <span>Все заявки</span>
          <span className="text-sm font-normal text-[var(--muted)]">
            {mainList.length} из {allRequests.length} · фильтр ниже
          </span>
          <span className="text-[var(--muted)]">▼</span>
        </summary>
        <div className="space-y-3 border-t border-[var(--border)] px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <label className="text-xs text-[var(--muted)] sm:shrink-0">
              Фильтр списка
            </label>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm sm:w-auto sm:min-w-[200px]"
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="new">{STATUS_RU.new}</option>
              <option value="assigned">{STATUS_RU.assigned}</option>
              <option value="in_progress">{STATUS_RU.in_progress}</option>
              <option value="done">{STATUS_RU.done}</option>
              <option value="canceled">{STATUS_RU.canceled}</option>
            </select>
          </div>
          {msg && (
            <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              {msg}
            </p>
          )}
          <ul className="max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto">
            {mainList.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-sm sm:p-4"
              >
                <div className="font-medium text-[var(--foreground)]">
                  #{row.id} {row.clientName} — {statusLabel(row.status)}
                </div>
                <div className="mt-1 text-[var(--muted)]">
                  {telHref(row.phone) ? (
                    <a
                      href={telHref(row.phone)!}
                      className="text-[var(--accent)] underline"
                    >
                      {row.phone}
                    </a>
                  ) : (
                    row.phone
                  )}
                  {" · "}
                  {yandexMapsSearchUrl(row.address) ? (
                    <a
                      href={yandexMapsSearchUrl(row.address)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] underline"
                    >
                      {row.address}
                    </a>
                  ) : (
                    row.address
                  )}
                </div>
                <div className="mt-2 text-[var(--foreground)]">
                  {row.problemText}
                </div>
                {row.status === "new" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {masters.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                        onClick={() => assign(row.id, m.id)}
                      >
                        Назначить {m.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                      onClick={() => cancel(row.id)}
                    >
                      Отменить
                    </button>
                  </div>
                )}
                {row.status !== "new" &&
                  row.status !== "done" &&
                  row.status !== "canceled" && (
                    <button
                      type="button"
                      className="mt-3 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs text-white"
                      onClick={() => cancel(row.id)}
                    >
                      Отменить
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </details>

      <details className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/50">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          История заявок <span className="text-[var(--muted)]">▼</span>
        </summary>
        <div className="border-t border-[var(--border)] px-3 py-3 sm:px-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-xs text-[var(--muted)]">
              Фильтр истории
            </label>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm sm:w-auto"
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
            >
              <option value="">Завершённые и отменённые</option>
              <option value="done">Только завершённые</option>
              <option value="canceled">Только отменённые</option>
            </select>
            <span className="text-xs text-[var(--muted)]">
              записей: {historyRows.length}
            </span>
          </div>
          {historyRows.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Пока нет записей в истории
            </p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {historyRows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-medium">#{row.id}</span>
                    <span>{row.clientName}</span>
                    <span className="text-[var(--muted)]">·</span>
                    <span>{statusLabel(row.status)}</span>
                    <span className="text-[var(--muted)]">·</span>
                    <span className="text-[var(--muted)]">
                      Исполнитель: {masterName(row.assignedTo)}
                    </span>
                  </div>
                  <details className="mt-2 rounded border border-[var(--border)]/60 bg-[var(--nav)]/30 px-2 py-1">
                    <summary className="cursor-pointer text-xs text-[var(--accent)]">
                      Подробнее о заявке
                    </summary>
                    <div className="mt-2 space-y-1 border-t border-[var(--border)]/50 pt-2 text-xs text-[var(--foreground)]">
                      <p>
                        <span className="text-[var(--muted)]">Телефон:</span>{" "}
                        {telHref(row.phone) ? (
                          <a
                            href={telHref(row.phone)!}
                            className="text-[var(--accent)] underline decoration-dotted hover:opacity-90"
                          >
                            {row.phone}
                          </a>
                        ) : (
                          row.phone
                        )}
                      </p>
                      <p>
                        <span className="text-[var(--muted)]">Адрес:</span>{" "}
                        {yandexMapsSearchUrl(row.address) ? (
                          <a
                            href={yandexMapsSearchUrl(row.address)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] underline decoration-dotted hover:opacity-90"
                          >
                            {row.address}
                          </a>
                        ) : (
                          row.address
                        )}
                        {yandexMapsSearchUrl(row.address) && (
                          <span className="ml-1 text-[var(--muted)]">
                            (Яндекс.Карты)
                          </span>
                        )}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <span className="text-[var(--muted)]">Описание:</span>{" "}
                        {row.problemText}
                      </p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[40vh] flex-col-reverse gap-2 overflow-y-auto border-t border-[var(--border)] bg-[var(--nav)]/98 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:left-auto sm:right-4 sm:max-w-md sm:rounded-t-xl"
        aria-live="polite"
      >
        <p className="text-center text-xs text-[var(--muted)]">
          События по заявкам
        </p>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-[var(--accent)]/40 bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] shadow-md"
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
