import { describe, it, expect } from "vitest";
import { buildSnapshot } from "./assistant";

const state = {
  tasks: [
    {
      id: "a",
      title: "Payer le loyer",
      context: "pro",
      status: "backlog",
      dueDate: "2026-06-14",
      doToday: true,
    },
    {
      id: "b",
      title: "Tâche finie",
      context: "pro",
      status: "done",
      dueDate: "",
    },
    { id: "c", title: "Perso", context: "perso", status: "backlog" },
  ],
  reqTickets: [
    {
      id: "REQ1",
      summary: "Relancer",
      status: "ACTIONABLE",
      dueAt: 1781000000000,
    },
    { id: "REQ2", summary: "Fini", status: "DONE", dueAt: null },
  ],
};

describe("buildSnapshot", () => {
  it("includes only active tasks of the context, with minimal fields", () => {
    const snap = buildSnapshot(state, "pro", "cockpit", "2026-06-13");
    expect(snap.tasks).toEqual([
      {
        id: "a",
        title: "Payer le loyer",
        status: "backlog",
        dueDate: "2026-06-14",
        doToday: true,
      },
    ]);
  });

  it("includes only open tickets", () => {
    const snap = buildSnapshot(state, "pro", "cockpit", "2026-06-13");
    expect(snap.reqTickets.map((t) => t.id)).toEqual(["REQ1"]);
  });

  it("carries view and today", () => {
    const snap = buildSnapshot(state, "pro", "tasks", "2026-06-13");
    expect(snap.view).toBe("tasks");
    expect(snap.today).toBe("2026-06-13");
  });
});
