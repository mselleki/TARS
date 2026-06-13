import { today } from "./date";
import { selectActiveTasks } from "./cockpit";

export function buildSnapshot(state, context, view, ref = today()) {
  const tasks = selectActiveTasks(state?.tasks ?? [], context)
    .slice(0, 60)
    .map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate || "",
      doToday: !!t.doToday,
    }));
  const reqTickets = (state?.reqTickets ?? [])
    .filter((t) => t.status !== "DONE")
    .slice(0, 40)
    .map((t) => ({
      id: t.id,
      summary: t.summary || "",
      status: t.status,
      dueAt: t.dueAt ?? null,
    }));
  return { tasks, reqTickets, view, today: ref };
}
