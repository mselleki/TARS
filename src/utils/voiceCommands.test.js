import { describe, it, expect } from "vitest";
import { interpretCommand, resolveAmbiguous } from "./voiceCommands";

const REF = "2026-06-13"; // samedi
const numberedTasks = [
  { id: "a", title: "Payer le loyer" },
  { id: "b", title: "Réviser chapitre 4" },
];
const activeTasks = [
  ...numberedTasks,
  { id: "c", title: "Appeler la banque" },
  { id: "d", title: "Appeler maman" },
];
const ctx = { numberedTasks, activeTasks, view: "cockpit", refISO: REF };

describe("navigation", () => {
  it("va aux tickets", () =>
    expect(interpretCommand("va aux tickets", ctx)).toEqual({
      kind: "navigate",
      view: "tickets",
    }));
  it("ouvre le cockpit", () =>
    expect(interpretCommand("ouvre le cockpit", ctx)).toEqual({
      kind: "navigate",
      view: "cockpit",
    }));
  it("montre les rituels", () =>
    expect(interpretCommand("montre les rituels", ctx)).toEqual({
      kind: "navigate",
      view: "rituals",
    }));
  it("affiche l'agenda", () =>
    expect(interpretCommand("affiche l'agenda", ctx)).toEqual({
      kind: "navigate",
      view: "agenda",
    }));
});

describe("complete", () => {
  it("by title", () =>
    expect(interpretCommand("termine le loyer", ctx)).toEqual({
      kind: "complete",
      taskId: "a",
    }));
  it("by number", () =>
    expect(interpretCommand("coche la 2", ctx)).toEqual({
      kind: "complete",
      taskId: "b",
    }));
  it("ambiguous → candidates", () => {
    const r = interpretCommand("termine appeler", ctx);
    expect(r.kind).toBe("ambiguous");
    expect(r.action).toBe("complete");
    expect(r.candidates.map((t) => t.id).sort()).toEqual(["c", "d"]);
  });
  it("not found → ambiguous with empty candidates", () => {
    expect(interpretCommand("termine introuvable", ctx)).toEqual({
      kind: "ambiguous",
      action: "complete",
      candidates: [],
    });
  });
});

describe("snooze", () => {
  it("reporte X à demain", () => {
    expect(interpretCommand("reporte le loyer à demain", ctx)).toEqual({
      kind: "snooze",
      taskId: "a",
      dueDate: "2026-06-14",
    });
  });
  it("décale la 2 à lundi", () => {
    const r = interpretCommand("décale la 2 à lundi", ctx);
    expect(r).toMatchObject({
      kind: "snooze",
      taskId: "b",
      dueDate: "2026-06-15",
    });
  });
  it("without a date → unknown", () => {
    expect(interpretCommand("reporte le loyer", ctx)).toEqual({
      kind: "unknown",
    });
  });
});

describe("queries", () => {
  it("today", () =>
    expect(interpretCommand("qu'est-ce que j'ai aujourd'hui", ctx)).toEqual({
      kind: "query",
      query: "today",
    }));
  it("overdue", () =>
    expect(interpretCommand("combien en retard", ctx)).toEqual({
      kind: "query",
      query: "overdue",
    }));
  it("next", () =>
    expect(interpretCommand("c'est quoi la prochaine échéance", ctx)).toEqual({
      kind: "query",
      query: "next",
    }));
});

describe("capture fallback", () => {
  it("plain phrase → capture (not a query despite the date word)", () => {
    const r = interpretCommand("réviser le cours aujourd'hui", ctx);
    expect(r.kind).toBe("capture");
    expect(r.parsed.dueDate).toBe("2026-06-13");
    expect(r.parsed.title).toBe("réviser le cours");
  });
  it("ticket capture by prefix", () => {
    const r = interpretCommand("ticket : relancer le fournisseur", ctx);
    expect(r.kind).toBe("capture");
    expect(r.parsed.target).toBe("ticket");
  });
});

describe("resolveAmbiguous", () => {
  it("resolves complete by number among candidates", () => {
    const pending = {
      action: "complete",
      candidates: [
        { id: "c", title: "Appeler la banque" },
        { id: "d", title: "Appeler maman" },
      ],
    };
    expect(resolveAmbiguous("la 2", pending)).toEqual({
      kind: "complete",
      taskId: "d",
    });
  });
  it("resolves snooze keeping the pending date", () => {
    const pending = {
      action: "snooze",
      dueDate: "2026-06-15",
      candidates: [
        { id: "c", title: "Appeler la banque" },
        { id: "d", title: "Appeler maman" },
      ],
    };
    expect(resolveAmbiguous("la banque", pending)).toEqual({
      kind: "snooze",
      taskId: "c",
      dueDate: "2026-06-15",
    });
  });
  it("returns unknown when still unresolved", () => {
    const pending = {
      action: "complete",
      candidates: [
        { id: "c", title: "Appeler la banque" },
        { id: "d", title: "Appeler maman" },
      ],
    };
    expect(resolveAmbiguous("appeler", pending)).toEqual({ kind: "unknown" });
  });
});
