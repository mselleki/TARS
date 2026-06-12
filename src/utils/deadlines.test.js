import { describe, it, expect } from "vitest";
import {
  daysUntil,
  isOverdue,
  formatCountdown,
  collectDeadlines,
} from "./deadlines";

const REF = "2026-06-11";

describe("daysUntil", () => {
  it("returns 0 for today", () => expect(daysUntil("2026-06-11", REF)).toBe(0));
  it("returns 1 for tomorrow", () =>
    expect(daysUntil("2026-06-12", REF)).toBe(1));
  it("returns negative for past dates", () =>
    expect(daysUntil("2026-06-09", REF)).toBe(-2));
  it("handles datetime strings by truncating", () =>
    expect(daysUntil("2026-06-12T15:30:00", REF)).toBe(1));
});

describe("isOverdue", () => {
  it("is false for today", () =>
    expect(isOverdue("2026-06-11", REF)).toBe(false));
  it("is true for yesterday", () =>
    expect(isOverdue("2026-06-10", REF)).toBe(true));
  it("is false for empty date", () => expect(isOverdue("", REF)).toBe(false));
});

describe("formatCountdown", () => {
  it("formats today", () => expect(formatCountdown(0)).toBe("aujourd'hui"));
  it("formats tomorrow", () => expect(formatCountdown(1)).toBe("demain"));
  it("formats future days", () => expect(formatCountdown(5)).toBe("J-5"));
  it("formats overdue", () =>
    expect(formatCountdown(-3)).toBe("en retard de 3 j"));
  it("formats one day overdue", () =>
    expect(formatCountdown(-1)).toBe("en retard de 1 j"));
});

describe("collectDeadlines", () => {
  const tasks = [
    {
      id: "t1",
      title: "Tâche datée",
      status: "backlog",
      dueDate: "2026-06-12",
    },
    { id: "t2", title: "Tâche finie", status: "done", dueDate: "2026-06-12" },
    { id: "t3", title: "Sans date", status: "backlog", dueDate: "" },
    { id: "t4", title: "En retard", status: "backlog", dueDate: "2026-06-09" },
  ];
  const reqTickets = [
    {
      id: "REQ1",
      summary: "Ticket urgent",
      status: "ACTIONABLE",
      dueAt: "2026-06-11",
    },
    { id: "REQ2", summary: "Ticket fini", status: "DONE", dueAt: "2026-06-11" },
    { id: "REQ3", summary: "", status: "WAITING_REPLY", dueAt: null },
  ];

  it("aggregates open dated items only, sorted by due date asc", () => {
    const result = collectDeadlines({ tasks, reqTickets }, REF);
    expect(result.map((d) => d.id)).toEqual(["t4", "REQ1", "t1"]);
  });

  it("marks overdue items and sets kind", () => {
    const result = collectDeadlines({ tasks, reqTickets }, REF);
    expect(result[0]).toMatchObject({ id: "t4", kind: "task", overdue: true });
    expect(result[1]).toMatchObject({
      id: "REQ1",
      kind: "ticket",
      overdue: false,
      title: "Ticket urgent",
    });
  });

  it("falls back to ticket id when summary is empty", () => {
    const result = collectDeadlines(
      {
        tasks: [],
        reqTickets: [
          {
            id: "REQ9",
            summary: "",
            status: "ACTIONABLE",
            dueAt: "2026-06-12",
          },
        ],
      },
      REF,
    );
    expect(result[0].title).toBe("REQ9");
  });

  it("handles numeric epoch-ms dueAt from real ticket data", () => {
    const dueMs = Date.UTC(2026, 5, 12); // 2026-06-12
    const result = collectDeadlines(
      {
        tasks: [],
        reqTickets: [
          {
            id: "REQ5",
            summary: "Epoch ticket",
            status: "ACTIONABLE",
            dueAt: dueMs,
          },
        ],
      },
      REF,
    );
    expect(result[0].due).toBe("2026-06-12");
    expect(result[0].days).toBe(1);
  });
});
