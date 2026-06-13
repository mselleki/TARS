import { describe, it, expect } from "vitest";
import { buildResponse } from "./assistant.js";

const snapshot = {
  tasks: [
    { id: "a", title: "Payer le loyer" },
    { id: "b", title: "Réviser" },
  ],
  reqTickets: [],
  view: "cockpit",
  today: "2026-06-13",
};

describe("buildResponse", () => {
  it("maps a navigate tool call to an action", () => {
    const content = [
      { type: "tool_use", name: "navigate", input: { view: "tickets" } },
    ];
    expect(buildResponse(content, snapshot)).toEqual({
      actions: [{ type: "navigate", view: "tickets" }],
      speech: "",
    });
  });

  it("maps create_item with optional fields defaulted", () => {
    const content = [
      {
        type: "tool_use",
        name: "create_item",
        input: { target: "task", title: "Appeler la banque" },
      },
    ];
    const r = buildResponse(content, snapshot);
    expect(r.actions).toEqual([
      {
        type: "create_item",
        target: "task",
        title: "Appeler la banque",
        dueDate: "",
        dueTime: "",
      },
    ]);
  });

  it("keeps complete_task only for ids present in the snapshot", () => {
    const content = [
      { type: "tool_use", name: "complete_task", input: { taskId: "a" } },
      { type: "tool_use", name: "complete_task", input: { taskId: "ghost" } },
    ];
    expect(buildResponse(content, snapshot).actions).toEqual([
      { type: "complete_task", taskId: "a" },
    ]);
  });

  it("keeps snooze_task only for known ids", () => {
    const content = [
      {
        type: "tool_use",
        name: "snooze_task",
        input: { taskId: "b", dueDate: "2026-06-14" },
      },
    ];
    expect(buildResponse(content, snapshot).actions).toEqual([
      { type: "snooze_task", taskId: "b", dueDate: "2026-06-14" },
    ]);
  });

  it("uses the answer tool text as speech when there is no free text", () => {
    const content = [
      {
        type: "tool_use",
        name: "answer",
        input: { text: "Tu as 2 choses aujourd'hui." },
      },
    ];
    expect(buildResponse(content, snapshot)).toEqual({
      actions: [],
      speech: "Tu as 2 choses aujourd'hui.",
    });
  });

  it("prefers free text over answer for speech, and collects multiple actions", () => {
    const content = [
      { type: "text", text: "C'est fait. " },
      { type: "tool_use", name: "complete_task", input: { taskId: "a" } },
      { type: "tool_use", name: "navigate", input: { view: "tasks" } },
    ];
    const r = buildResponse(content, snapshot);
    expect(r.speech).toBe("C'est fait.");
    expect(r.actions).toEqual([
      { type: "complete_task", taskId: "a" },
      { type: "navigate", view: "tasks" },
    ]);
  });

  it("returns empty result for empty content", () => {
    expect(buildResponse([], snapshot)).toEqual({ actions: [], speech: "" });
  });
});
