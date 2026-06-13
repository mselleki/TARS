import { normalize } from "./text";

const ORDINALS = {
  premier: 1,
  premiere: 1,
  deuxieme: 2,
  deux: 2,
  second: 2,
  seconde: 2,
  troisieme: 3,
  trois: 3,
  quatrieme: 4,
  quatre: 4,
  cinquieme: 5,
  cinq: 5,
  sixieme: 6,
  six: 6,
  septieme: 7,
  sept: 7,
  huitieme: 8,
  huit: 8,
};

const STOP = new Set([
  "les",
  "des",
  "une",
  "mon",
  "mes",
  "ton",
  "tes",
  "ses",
  "nos",
  "vos",
  "leur",
  "pour",
  "avec",
  "tache",
  "taches",
]);

function numberFromTarget(norm) {
  const t = norm.trim();
  const m =
    /^(?:la\s+|le\s+|l['']\s*|numero\s+|tache\s+|n[°o]\s*|#\s*)?(\d{1,2})$/.exec(
      t,
    );
  if (m) return Number(m[1]);
  for (const word of Object.keys(ORDINALS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return ORDINALS[word];
  }
  return null;
}

export function matchTask(query, { numberedTasks = [], activeTasks = [] }) {
  const norm = normalize(query);

  const n = numberFromTarget(norm);
  if (n != null) {
    const task = numberedTasks[n - 1];
    return task ? { status: "one", task } : { status: "none" };
  }

  const words = norm.split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));
  if (!words.length) return { status: "none" };

  const scored = activeTasks
    .map((task) => {
      const titleNorm = normalize(task.title);
      const score = words.filter((w) => titleNorm.includes(w)).length;
      return { task, score };
    })
    .filter((s) => s.score > 0);

  if (!scored.length) return { status: "none" };

  const max = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === max);
  if (top.length === 1) return { status: "one", task: top[0].task };
  return { status: "many", candidates: top.slice(0, 3).map((s) => s.task) };
}
