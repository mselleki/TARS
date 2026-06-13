import { describe, it, expect } from "vitest";
import { selectNowTasks, selectActiveTasks } from "./cockpit";

const REF = "2026-06-13";
const tasks = [
  {
    id: "over",
    title: "En retard",
    context: "pro",
    status: "backlog",
    dueDate: "2026-06-10",
  },
  {
    id: "today",
    title: "Du jour",
    context: "pro",
    status: "backlog",
    dueDate: "2026-06-13",
    dueTime: "09:00",
  },
  {
    id: "focus",
    title: "Focus",
    context: "pro",
    status: "backlog",
    dueDate: "",
    doToday: true,
  },
  {
    id: "future",
    title: "Plus tard",
    context: "pro",
    status: "backlog",
    dueDate: "2026-06-30",
  },
  {
    id: "done",
    title: "Faite",
    context: "pro",
    status: "done",
    dueDate: "2026-06-13",
  },
  {
    id: "perso",
    title: "Perso",
    context: "perso",
    status: "backlog",
    doToday: true,
  },
];

describe("selectNowTasks", () => {
  it("keeps overdue/today/doToday of the context, overdue first, excludes done/future/other-context", () => {
    const r = selectNowTasks(tasks, "pro", { focusTaskIds: [] }, REF);
    expect(r.map((t) => t.id)).toEqual(["over", "today", "focus"]);
  });
  it("includes focus tasks from the daily plan", () => {
    const r = selectNowTasks(tasks, "pro", { focusTaskIds: ["future"] }, REF);
    expect(r.map((t) => t.id)).toContain("future");
  });
  it("caps at 8 items", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `t${i}`,
      title: `T${i}`,
      context: "pro",
      status: "backlog",
      doToday: true,
    }));
    expect(selectNowTasks(many, "pro", { focusTaskIds: [] }, REF)).toHaveLength(
      8,
    );
  });
});

describe("selectActiveTasks", () => {
  it("returns non-done tasks of the context only", () => {
    expect(
      selectActiveTasks(tasks, "pro")
        .map((t) => t.id)
        .sort(),
    ).toEqual(["focus", "future", "over", "today"]);
  });
});
