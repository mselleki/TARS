import { describe, it, expect } from "vitest";
import { parseQuickInput } from "./quickParse";

const REF = "2026-06-11"; // un jeudi

describe("parseQuickInput — cible", () => {
  it("defaults to task", () => {
    expect(parseQuickInput("payer le loyer", REF).target).toBe("task");
  });
  it("detects ticket prefix", () => {
    const r = parseQuickInput("ticket : relancer le fournisseur", REF);
    expect(r.target).toBe("ticket");
    expect(r.title).toBe("relancer le fournisseur");
  });
  it("detects note prefix case-insensitively", () => {
    const r = parseQuickInput("Note: idée pour le standup", REF);
    expect(r.target).toBe("note");
    expect(r.title).toBe("idée pour le standup");
  });
});

describe("parseQuickInput — dates", () => {
  it("parses demain", () => {
    const r = parseQuickInput("payer le loyer demain", REF);
    expect(r.dueDate).toBe("2026-06-12");
    expect(r.title).toBe("payer le loyer");
  });
  it("parses aujourd'hui", () => {
    expect(parseQuickInput("appeler la banque aujourd'hui", REF).dueDate).toBe(
      "2026-06-11",
    );
  });
  it("parses aujourd’hui with typographic apostrophe", () => {
    expect(parseQuickInput("appeler la banque aujourd’hui", REF).dueDate).toBe(
      "2026-06-11",
    );
  });
  it("parses après-demain before demain", () => {
    expect(parseQuickInput("rendez-vous après-demain", REF).dueDate).toBe(
      "2026-06-13",
    );
  });
  it("parses dans N jours", () => {
    const r = parseQuickInput("relancer dans 3 jours", REF);
    expect(r.dueDate).toBe("2026-06-14");
    expect(r.title).toBe("relancer");
  });
  it("parses next weekday occurrence (vendredi = tomorrow)", () => {
    expect(parseQuickInput("rendu vendredi", REF).dueDate).toBe("2026-06-12");
  });
  it("parses weekday equal to today as next week", () => {
    expect(parseQuickInput("réunion jeudi", REF).dueDate).toBe("2026-06-18");
  });
  it("parses lundi prochain", () => {
    const r = parseQuickInput("point lundi prochain", REF);
    expect(r.dueDate).toBe("2026-06-15");
    expect(r.title).toBe("point");
  });
  it("returns empty dueDate when no date", () => {
    const r = parseQuickInput("ranger le bureau", REF);
    expect(r.dueDate).toBe("");
    expect(r.title).toBe("ranger le bureau");
  });
});

describe("parseQuickInput — heure", () => {
  it("parses à 18h", () => {
    const r = parseQuickInput("réviser chapitre 4 demain à 18h", REF);
    expect(r.dueTime).toBe("18:00");
    expect(r.dueDate).toBe("2026-06-12");
    expect(r.title).toBe("réviser chapitre 4");
  });
  it("parses 9h30", () => {
    expect(parseQuickInput("standup à 9h30", REF).dueTime).toBe("09:30");
  });
  it("ignores numbers without h", () => {
    const r = parseQuickInput("lire 20 pages", REF);
    expect(r.dueTime).toBe("");
    expect(r.title).toBe("lire 20 pages");
  });
});
