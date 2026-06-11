import { today } from "./date";

const DAY_NAMES = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

// NFD conserve la longueur après suppression des diacritiques combinants,
// ce qui permet de découper le texte original avec les indices du texte normalisé.
function normalize(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(refISO, n) {
  const d = new Date(`${refISO}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function dayOfWeek(refISO) {
  return new Date(`${refISO}T12:00:00`).getDay();
}

function removeAt(text, index, length) {
  return (text.slice(0, index) + text.slice(index + length))
    .replace(/\s{2,}/g, " ")
    .trim();
}

const DATE_RULES = [
  { re: /\bapres[- ]demain\b/, resolve: () => 2 },
  { re: /\bdemain\b/, resolve: () => 1 },
  { re: /\baujourd'?hui\b/, resolve: () => 0 },
  { re: /\bdans\s+(\d+)\s+jours?\b/, resolve: (m) => Number(m[1]) },
  {
    re: /\b(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)(\s+prochain)?\b/,
    resolve: (m, refISO) => {
      const target = DAY_NAMES.indexOf(m[1]);
      const delta = (target - dayOfWeek(refISO) + 7) % 7;
      return delta === 0 ? 7 : delta;
    },
  },
];

export function parseQuickInput(raw, refISO = today()) {
  let text = String(raw ?? "").trim();
  let target = "task";

  const prefix = /^(ticket|note)\s*:\s*/i.exec(text);
  if (prefix) {
    target = prefix[1].toLowerCase();
    text = text.slice(prefix[0].length);
  }

  let dueDate = "";
  for (const rule of DATE_RULES) {
    const m = rule.re.exec(normalize(text));
    if (m) {
      dueDate = addDays(refISO, rule.resolve(m, refISO));
      text = removeAt(text, m.index, m[0].length);
      break;
    }
  }

  let dueTime = "";
  const timeMatch =
    /(?:\ba\s+)?\b([01]?\d|2[0-3])\s*h\s*([0-5]\d)?(?=\s|$)/.exec(
      normalize(text),
    );
  if (timeMatch) {
    dueTime = `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2] ?? "00"}`;
    text = removeAt(text, timeMatch.index, timeMatch[0].length);
  }

  return { target, title: text.trim(), dueDate, dueTime };
}
