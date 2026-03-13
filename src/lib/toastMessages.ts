/** Человекочитаемые подписи статусов (тосты и UI). */
export const STATUS_RU: Record<string, string> = {
  new: "Новая (в очереди)",
  assigned: "Назначена мастеру",
  in_progress: "В работе",
  done: "Завершена",
  canceled: "Отменена",
};

export function toastNewRequest(id: number) {
  return `Заявка #${id}: ${STATUS_RU.new}`;
}

export function toastAssigned(id: number, masterName: string) {
  return `Заявка #${id}: ${STATUS_RU.assigned} — ${masterName}`;
}

export function toastCanceledByDispatcher(id: number) {
  return `Заявка #${id}: ${STATUS_RU.canceled} (диспетчер)`;
}

export function toastInProgress(id: number, masterName: string) {
  return `Заявка #${id}: ${STATUS_RU.in_progress} — ${masterName}`;
}

export function toastDone(id: number, masterName: string) {
  return `Заявка #${id}: ${STATUS_RU.done} — ${masterName}`;
}

export function toastReturnedToQueue(id: number, masterName: string) {
  return `Заявка #${id}: снова ${STATUS_RU.new.toLowerCase()} — ${masterName} вернул заявку диспетчеру`;
}

/** Для мастера: назначение с контекстом */
export function toastMasterAssigned(
  id: number,
  clientName: string,
  problemShort: string
) {
  const hint =
    problemShort.length > 60 ? `${problemShort.slice(0, 60)}…` : problemShort;
  return `Вам назначена заявка #${id} · ${clientName} · ${hint}`;
}

/** TASK.txt:43 — второй параллельный take или чужой мастер */
export function toastTakeAlreadyInProgress(id: number, masterName: string) {
  return `Заявка #${id} уже взята мастером ${masterName}`;
}

export function toastTakeNotYours(id: number, assignedMaster: string) {
  return `Заявка #${id} назначена мастеру ${assignedMaster}, не вам`;
}
