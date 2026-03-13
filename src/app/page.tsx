import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6 py-8">
      <h1 className="text-2xl font-bold">Сервис заявок в ремонтную службу</h1>
      <p className="text-white/70">
        Оформите заявку или войдите как диспетчер / мастер.
      </p>
      <ul className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Link
          href="/request/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium hover:bg-blue-500"
        >
          Создать заявку
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-white/20 px-4 py-2 text-center hover:bg-white/5"
        >
          Вход (диспетчер / мастер)
        </Link>
      </ul>
    </div>
  );
}
