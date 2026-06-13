import { describe, it, expect } from "vitest";
import { matchTask } from "./taskMatch";

const numberedTasks = [
  { id: "a", title: "Payer le loyer" },
  { id: "b", title: "Réviser chapitre 4" },
  { id: "c", title: "Appeler la banque" },
];
const activeTasks = [
  ...numberedTasks,
  { id: "d", title: "Appeler maman" },
  { id: "e", title: "Ranger le bureau" },
];

describe("matchTask — numéro", () => {
  it("matches a bare digit", () => {
    expect(matchTask("2", { numberedTasks, activeTasks })).toEqual({
      status: "one",
      task: numberedTasks[1],
    });
  });
  it('matches "la 3"', () => {
    expect(matchTask("la 3", { numberedTasks, activeTasks }).task.id).toBe("c");
  });
  it('matches "numéro 1"', () => {
    expect(matchTask("numéro 1", { numberedTasks, activeTasks }).task.id).toBe(
      "a",
    );
  });
  it('matches ordinal "la première"', () => {
    expect(
      matchTask("la première", { numberedTasks, activeTasks }).task.id,
    ).toBe("a");
  });
  it('matches ordinal "deuxième"', () => {
    expect(matchTask("deuxième", { numberedTasks, activeTasks }).task.id).toBe(
      "b",
    );
  });
  it("returns none for out-of-range number", () => {
    expect(matchTask("9", { numberedTasks, activeTasks })).toEqual({
      status: "none",
    });
  });
});

describe("matchTask — titre flou", () => {
  it("matches a unique title fragment", () => {
    expect(matchTask("le loyer", { numberedTasks, activeTasks }).task.id).toBe(
      "a",
    );
  });
  it("ignores accents and case", () => {
    expect(
      matchTask("REVISER chapitre", { numberedTasks, activeTasks }).task.id,
    ).toBe("b");
  });
  it("returns many on ambiguous fragment", () => {
    const r = matchTask("appeler", { numberedTasks, activeTasks });
    expect(r.status).toBe("many");
    expect(r.candidates.map((t) => t.id).sort()).toEqual(["c", "d"]);
  });
  it("returns none when no word matches", () => {
    expect(
      matchTask("xyz introuvable", { numberedTasks, activeTasks }),
    ).toEqual({ status: "none" });
  });
  it("does not treat a number inside a title as a numeric ref", () => {
    expect(
      matchTask("chapitre 4", { numberedTasks, activeTasks }).task.id,
    ).toBe("b");
  });
});
