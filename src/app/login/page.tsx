"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("dispatcher");
  const [password, setPassword] = useState("disp123");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error ?? "Ошибка");
      return;
    }
    if (j.user.role === "dispatcher") router.push("/dispatcher");
    else router.push("/master");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-8">
      <h1 className="text-xl font-bold">Вход</h1>
      <p className="text-sm text-white/60">
        Тест: dispatcher/disp123, master1/m1pass, master2/m2pass
      </p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-white/10 bg-[var(--card)] p-4">
        <div>
          <label className="block text-sm">Логин</label>
          <input
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Пароль</label>
          <input
            type="password"
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 font-medium hover:bg-blue-500"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
