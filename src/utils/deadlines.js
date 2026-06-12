import { today } from "./date";

const MS_PER_DAY = 86400000;

function toUTC(dateStr) {
  const s = String(dateStr).slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysUntil(dateStr, ref = today()) {
  return Math.round((toUTC(dateStr) - toUTC(ref)) / MS_PER_DAY);
}

export function isOverdue(dateStr, ref = today()) {
  if (!dateStr) return false;
  return daysUntil(dateStr, ref) < 0;
}

export function formatCountdown(days) {
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "demain";
  if (days > 1) return `J-${days}`;
  return `en retard de ${-days} j`;
}

export function collectDeadlines(
  { tasks = [], reqTickets = [] },
  ref = today(),
) {
  const items = [];
  for (const t of tasks) {
    if (t.status === "done" || !t.dueDate) continue;
    items.push({
      id: t.id,
      kind: "task",
      title: t.title,
      due: String(t.dueDate).slice(0, 10),
    });
  }
  for (const t of reqTickets) {
    if (t.status === "DONE" || !t.dueAt) continue;
    const due =
      typeof t.dueAt === "number"
        ? new Date(t.dueAt).toISOString().slice(0, 10)
        : String(t.dueAt).slice(0, 10);
    items.push({ id: t.id, kind: "ticket", title: t.summary || t.id, due });
  }
  for (const item of items) {
    item.days = daysUntil(item.due, ref);
    item.overdue = item.days < 0;
    item.label = formatCountdown(item.days);
  }
  return items.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
}
