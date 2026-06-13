import { parseQuickInput } from "./quickParse";
import { matchTask } from "./taskMatch";
import { normalize } from "./text";

const NAV_VERB =
  /\b(va|vas|aller|ouvre|ouvrir|montre|montrer|affiche|afficher|retour)\b/;
const MODULES = [
  { re: /\b(cockpit|accueil|tableau de bord)\b/, view: "cockpit" },
  { re: /\b(taches?|todo|a faire)\b/, view: "tasks" },
  { re: /\b(projets?)\b/, view: "projects" },
  { re: /\b(tickets?)\b/, view: "tickets" },
  { re: /\b(rituels?|habitudes?)\b/, view: "rituals" },
  { re: /\b(notes?)\b/, view: "notes" },
  { re: /\b(agenda|calendrier)\b/, view: "agenda" },
  { re: /\b(cours)\b/, view: "courses" },
];
const COMPLETE_VERB =
  /\b(termine[rs]?|coche[rs]?|finis|finir|valide[rs]?|faite?)\b/;
const SNOOZE_VERB = /\b(reporte[rs]?|decale[rs]?|repousse[rs]?|deplace[rs]?)\b/;
const TARGET_FILLERS = /\b(la|le|les|l|ma|mon|mes|a|au|aux|de|du)\b/g;
const QUERY_RULES = [
  {
    re: /(qu['' ]?est[- ]?ce que j['' ]?ai|qu['' ]?ai[- ]?je|ma journee|mes taches du jour|quoi a faire)/,
    query: "today",
  },
  {
    re: /(combien.*retard|mes retards|quoi.*en retard|qu['' ]?est[- ]?ce qui est en retard)/,
    query: "overdue",
  },
  {
    re: /(prochaine echeance|la prochaine|ma prochaine|quoi de prochain)/,
    query: "next",
  },
];

function stripFillers(norm) {
  return norm
    .replace(TARGET_FILLERS, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function interpretCommand(transcript, ctx = {}) {
  const { numberedTasks = [], activeTasks = [], refISO } = ctx;
  const raw = String(transcript ?? "").trim();
  const norm = normalize(raw);
  const matchCtx = { numberedTasks, activeTasks };

  // 1. Navigation (verbe + module)
  if (NAV_VERB.test(norm)) {
    for (const m of MODULES) {
      if (m.re.test(norm)) return { kind: "navigate", view: m.view };
    }
  }

  // 2. Cocher / terminer
  if (COMPLETE_VERB.test(norm)) {
    const target = stripFillers(norm.replace(COMPLETE_VERB, " "));
    const r = matchTask(target, matchCtx);
    if (r.status === "one") return { kind: "complete", taskId: r.task.id };
    if (r.status === "many")
      return {
        kind: "ambiguous",
        action: "complete",
        candidates: r.candidates,
      };
    return { kind: "ambiguous", action: "complete", candidates: [] };
  }

  // 3. Reporter
  if (SNOOZE_VERB.test(norm)) {
    const afterVerb = norm.replace(SNOOZE_VERB, " ").trim();
    const parsed = parseQuickInput(afterVerb, refISO);
    if (!parsed.dueDate) return { kind: "unknown" };
    const target = stripFillers(normalize(parsed.title));
    const r = matchTask(target, matchCtx);
    if (r.status === "one")
      return { kind: "snooze", taskId: r.task.id, dueDate: parsed.dueDate };
    if (r.status === "many")
      return {
        kind: "ambiguous",
        action: "snooze",
        candidates: r.candidates,
        dueDate: parsed.dueDate,
      };
    return {
      kind: "ambiguous",
      action: "snooze",
      candidates: [],
      dueDate: parsed.dueDate,
    };
  }

  // 4. Requêtes
  for (const q of QUERY_RULES) {
    if (q.re.test(norm)) return { kind: "query", query: q.query };
  }

  // 5. Fallback capture
  return { kind: "capture", parsed: parseQuickInput(raw, refISO) };
}

export function resolveAmbiguous(transcript, pending) {
  const candidates = pending.candidates ?? [];
  const r = matchTask(transcript, {
    numberedTasks: candidates,
    activeTasks: candidates,
  });
  if (r.status !== "one") return { kind: "unknown" };
  if (pending.action === "snooze")
    return { kind: "snooze", taskId: r.task.id, dueDate: pending.dueDate };
  return { kind: "complete", taskId: r.task.id };
}
