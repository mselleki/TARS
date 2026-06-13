import { today } from "./date";

export function selectActiveTasks(tasks = [], context) {
  return tasks.filter((t) => t.context === context && t.status !== "done");
}

export function selectNowTasks(tasks = [], context, todayPlan, ref = today()) {
  const focusIds = todayPlan?.focusTaskIds ?? [];
  const isNow = (t) =>
    t.status !== "done" &&
    (t.doToday ||
      focusIds.includes(t.id) ||
      (t.dueDate && String(t.dueDate).slice(0, 10) <= ref));
  const rank = (t) => {
    if (t.dueDate && String(t.dueDate).slice(0, 10) < ref) return 0;
    if (t.dueDate && String(t.dueDate).slice(0, 10) === ref) return 1;
    if (t.doToday || focusIds.includes(t.id)) return 2;
    return 3;
  };
  return tasks
    .filter((t) => t.context === context)
    .filter(isNow)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        String(a.dueTime ?? "").localeCompare(String(b.dueTime ?? "")),
    )
    .slice(0, 8);
}
