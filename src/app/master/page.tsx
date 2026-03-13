"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { STATUS_RU, toastMasterAssigned } from "@/lib/toastMessages";

type Row = {
  id: number;
  clientName: string;
  phone: string;
  address: string;
  problemText: string;
  status: string;
  assignedTo: number | null;
};

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

function RequestCard({
  row,
  onTake,
  onComplete,
  onCancelRequest,
  showCancel,
}: {
  row: Row;
  onTake: (id: number) => void;
  onComplete: (id: number) => void;
  onCancelRequest: (id: number) => void;
  showCancel?: boolean;
}) {
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4">
      <div className="font-medium">
        #{row.id} {row.clientName} — {statusLabel(row.status)}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
        {telHref(row.phone) ? (
          <a
            href={telHref(row.phone)!}
            className="text-[var(--accent)] underline"
          >
            {row.phone}
          </a>
        ) : (
          <span>{row.phone}</span>
        )}
        <span>·</span>
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
          <span>{row.address}</span>
        )}
        {yandexMapsSearchUrl(row.address) && (
          <span className="text-xs">(карты)</span>
        )}
      </div>
      <div className="mt-2 text-sm">{row.problemText}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {row.status === "assigned" && (
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
            onClick={() => onTake(row.id)}
          >
            Взять в работу
          </button>
        )}
        {row.status === "in_progress" && (
          <>
            <button
              type="button"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
              onClick={() => onComplete(row.id)}
            >
              Завершить
            </button>
            {showCancel && (
              <button
                type="button"
                className="rounded-lg border border-red-600/60 bg-red-500/10 px-3 py-1.5 text-xs text-red-800 dark:text-red-200"
                onClick={() => onCancelRequest(row.id)}
              >
                Отменить заявку
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

function Section({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group rounded-xl border border-[var(--border)] bg-[var(--nav)]/50"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span>
          {title} <span className="text-[var(--muted)]">({count})</span>
        </span>
        <span className="text-[var(--muted)] transition group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="border-t border-[var(--border)] px-3 pb-3 pt-2 sm:px-4">
        {children}
      </div>
    </details>
  );
}

export default function MasterPage() {
  const [uid, setUid] = useState<number | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [mine, setMine] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [modalId, setModalId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const uidRef = useRef<number | null>(null);

  const pushToast = useCallback((text: string) => {
    const id = `m-${++toastId.current}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      12000
    );
  }, []);

  const load = useCallback(async () => {
    setMsg("");
    const meR = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    const me = await safeJson<{ user?: { id: number; role: string } }>(meR);
    const user = me && "user" in me ? me.user : undefined;
    if (!user?.id || user.role !== "master") {
      window.location.href = `/login?next=${encodeURIComponent("/master")}`;
      return;
    }
    setAllowed(true);
    setUid(user.id);
    uidRef.current = user.id;

    const r = await fetch(`/api/requests?_t=${Date.now()}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await safeJson<Row[]>(r);
    if (!Array.isArray(data)) {
      setMsg(
        (data as { error?: string })?.error ??
          (r.ok ? "Пустой ответ" : `Ошибка ${r.status}`)
      );
      setMine([]);
      return;
    }
    setMine(data.filter((x) => x.assignedTo === user.id));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof EventSource === "undefined" || allowed !== true) return;
    const es = new EventSource("/api/events/stream", { withCredentials: true });
    const runLoad = () => load();
    es.onmessage = (ev) => {
      if (!ev.data || ev.data.startsWith("{") === false) return;
      try {
        const p = JSON.parse(ev.data) as {
          type?: string;
          masterId?: number;
          requestId?: number;
          clientName?: string;
          problemText?: string;
        };
        if (p.type === "dispatcher_toast") {
          runLoad();
          return;
        }
        if (
          p.type === "assigned_to_master" &&
          p.masterId === uidRef.current &&
          p.requestId != null
        ) {
          pushToast(
            toastMasterAssigned(
              p.requestId,
              p.clientName || "Клиент",
              p.problemText || "без описания"
            )
          );
          runLoad();
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {};
    const t = setInterval(runLoad, 8000);
    return () => {
      es.close();
      clearInterval(t);
    };
  }, [allowed, load, pushToast]);

  const { active, fresh, done, canceled } = useMemo(() => {
    const active = mine.filter((x) => x.status === "in_progress");
    const fresh = mine.filter((x) => x.status === "assigned");
    const done = mine.filter((x) => x.status === "done");
    const canceled = mine.filter((x) => x.status === "canceled");
    return { active, fresh, done, canceled };
  }, [mine]);

  async function take(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}/take`, {
      method: "POST",
      credentials: "include",
    });
    const j = (await safeJson(r)) as { error?: string; toast?: string };
    if ((r.status === 409 || r.status === 403) && j?.toast) pushToast(j.toast);
    if (r.status === 409)
      setMsg(`#${id}: ${j?.toast ?? j?.error ?? "конфликт"}`);
    else if (!r.ok) setMsg(j?.error ?? "Ошибка");
    load();
  }

  async function complete(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}/complete`, {
      method: "POST",
      credentials: "include",
    });
    const j = (await safeJson(r)) as { error?: string };
    if (!r.ok) setMsg(j?.error ?? "Ошибка");
    else load();
  }

  async function confirmCancelRequest() {
    if (modalId == null) return;
    const id = modalId;
    setModalId(null);
    setMsg("");
    const r = await fetch(`/api/requests/${id}/return`, {
      method: "POST",
      credentials: "include",
    });
    const j = (await safeJson(r)) as { error?: string };
    if (!r.ok) setMsg(j?.error ?? "Ошибка");
    else load();
  }

  if (allowed !== true || uid === null) {
    return (
      <div className="space-y-3 py-8 text-center text-[var(--muted)]">
        <p>Проверка доступа…</p>
        <Link
          href="/login?next=%2Fmaster"
          className="text-[var(--accent)] underline"
        >
          Войти как мастер
        </Link>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pb-28 py-4 sm:py-6">
      <h1 className="text-lg font-bold sm:text-xl">Кабинет мастера</h1>
      <p className="text-sm text-[var(--muted)]">
        Уведомления о назначениях — внизу экрана (как у диспетчера), без
        всплывающего окна браузера.
      </p>
      {msg && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {msg}
        </p>
      )}

      <div className="space-y-3">
        <Section title="Активные заявки" count={active.length} defaultOpen>
          {active.length === 0 ? (
            <p className="py-2 text-sm text-[var(--muted)]">
              Нет заявок в работе
            </p>
          ) : (
            <ul className="space-y-3">
              {active.map((row) => (
                <RequestCard
                  key={row.id}
                  row={row}
                  onTake={take}
                  onComplete={complete}
                  onCancelRequest={setModalId}
                  showCancel
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Новые заявки" count={fresh.length} defaultOpen>
          {fresh.length === 0 ? (
            <p className="py-2 text-sm text-[var(--muted)]">
              Нет новых назначений
            </p>
          ) : (
            <ul className="space-y-3">
              {fresh.map((row) => (
                <RequestCard
                  key={row.id}
                  row={row}
                  onTake={take}
                  onComplete={complete}
                  onCancelRequest={setModalId}
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Завершённые заявки" count={done.length}>
          {done.length === 0 ? (
            <p className="py-2 text-sm text-[var(--muted)]">Пока нет</p>
          ) : (
            <ul className="space-y-3">
              {done.map((row) => (
                <RequestCard
                  key={row.id}
                  row={row}
                  onTake={take}
                  onComplete={complete}
                  onCancelRequest={setModalId}
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Отменённые заявки" count={canceled.length}>
          {canceled.length === 0 ? (
            <p className="py-2 text-sm text-[var(--muted)]">Пока нет</p>
          ) : (
            <ul className="space-y-3">
              {canceled.map((row) => (
                <RequestCard
                  key={row.id}
                  row={row}
                  onTake={take}
                  onComplete={complete}
                  onCancelRequest={setModalId}
                />
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[36vh] flex-col-reverse gap-2 overflow-y-auto border-t border-[var(--border)] bg-[var(--nav)]/98 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:left-auto sm:right-4 sm:max-w-md sm:rounded-t-xl"
        aria-live="polite"
      >
        <p className="text-center text-xs font-medium text-[var(--muted)]">
          Уведомления мастера
        </p>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-emerald-600/40 bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] shadow-md"
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>

      {modalId != null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
            <h2 id="cancel-modal-title" className="text-lg font-semibold">
              Отменить заявку?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Заявка #{modalId} вернётся диспетчеру в список «Новые» (статус
              new).
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--nav)]"
                onClick={() => setModalId(null)}
              >
                Не отменять
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={confirmCancelRequest}
              >
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
