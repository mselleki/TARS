import { useMemo } from "react";
import { collectDeadlines, isOverdue } from "../utils/deadlines";
import { today } from "../utils/date";

const TILES = [
  { view: "rituals", color: "rituals", label: "Rituels" },
  { view: "projects", color: "projects", label: "Projets" },
  { view: "agenda", color: "agenda", label: "Agenda" },
  { view: "notes", color: "notes", label: "Notes" },
  { view: "courses", color: "courses", label: "Cours" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Bonsoir";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function frenchDate() {
  const s = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function NowRow({ task, onToggle }) {
  const overdue = isOverdue(task.dueDate);
  return (
    <li
      className="flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        style={{
          borderColor: overdue ? "var(--overdue)" : "var(--border-strong)",
        }}
        aria-label="Marquer comme fait"
      />
      <span
        className="min-w-0 flex-1 truncate text-sm"
        style={{ color: "var(--text)" }}
      >
        {task.title}
      </span>
      {task.dueTime && (
        <span className="shrink-0 text-xs" style={{ color: "var(--muted)" }}>
          {task.dueTime}
        </span>
      )}
      {overdue && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "var(--overdue-bg)", color: "var(--overdue)" }}
        >
          en retard
        </span>
      )}
    </li>
  );
}

export function CockpitView({
  context,
  tasks = [],
  reqTickets = [],
  rituals = [],
  projects = [],
  todayPlan,
  onToggleTask,
  onNavigate,
}) {
  const todayStr = today();
  const contextTasks = useMemo(
    () => tasks.filter((t) => t.context === context),
    [tasks, context],
  );

  const nowTasks = useMemo(() => {
    const focusIds = todayPlan?.focusTaskIds ?? [];
    const isNow = (t) =>
      t.status !== "done" &&
      (t.doToday ||
        focusIds.includes(t.id) ||
        (t.dueDate && String(t.dueDate).slice(0, 10) <= todayStr));
    const rank = (t) => {
      if (t.dueDate && String(t.dueDate).slice(0, 10) < todayStr) return 0;
      if (t.doToday || focusIds.includes(t.id)) return 1;
      return 2;
    };
    return contextTasks
      .filter(isNow)
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          String(a.dueTime ?? "").localeCompare(String(b.dueTime ?? "")),
      )
      .slice(0, 8);
  }, [contextTasks, todayPlan, todayStr]);

  const deadlines = useMemo(
    () =>
      collectDeadlines({ tasks: contextTasks, reqTickets }, todayStr).slice(
        0,
        5,
      ),
    [contextTasks, reqTickets, todayStr],
  );

  const counts = useMemo(
    () => ({
      rituals: rituals.length,
      projects: projects.filter(
        (p) => p.context === context && !p.parentProjectId,
      ).length,
      agenda: tasks.filter(
        (t) => t.context === "perso" && t.dueDate && t.status !== "done",
      ).length,
      notes: null,
      courses: null,
    }),
    [rituals, projects, tasks, context],
  );

  const doneToday = contextTasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
        >
          {greeting()} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {frenchDate()} — {nowTasks.length} chose
          {nowTasks.length > 1 ? "s" : ""} à faire, {doneToday} faite
          {doneToday > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Maintenant */}
        <section aria-label="Maintenant">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em]"
            style={{ color: "var(--muted)" }}
          >
            Maintenant
          </p>
          {nowTasks.length === 0 ? (
            <div
              className="rounded-[var(--radius-xl)] p-6 text-center text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              Rien d'urgent. Profitez-en ou planifiez la suite ✨
            </div>
          ) : (
            <ul className="space-y-2">
              {nowTasks.map((t) => (
                <NowRow key={t.id} task={t} onToggle={onToggleTask} />
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => onNavigate?.("tasks")}
            className="mt-2 text-xs font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--muted)" }}
          >
            Toutes les tâches →
          </button>
        </section>

        {/* Échéances */}
        <section aria-label="Échéances">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em]"
            style={{ color: "var(--muted)" }}
          >
            Échéances
          </p>
          <div
            className="overflow-hidden rounded-[var(--radius-xl)]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {deadlines.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: "var(--muted)" }}>
                Aucune échéance à venir.
              </p>
            ) : (
              <ul>
                {deadlines.map((d) => (
                  <li key={`${d.kind}-${d.id}`}>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate?.(d.kind === "ticket" ? "tickets" : "tasks")
                      }
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background:
                            d.kind === "ticket"
                              ? "var(--mod-tickets)"
                              : "var(--mod-tasks)",
                        }}
                        aria-hidden
                      />
                      <span
                        className="min-w-0 flex-1 truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {d.title}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: d.overdue
                            ? "var(--overdue-bg)"
                            : "var(--surface-2)",
                          color: d.overdue ? "var(--overdue)" : "var(--muted)",
                        }}
                      >
                        {d.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Tuiles modules */}
      <section aria-label="Modules">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TILES.map((tile) => (
            <button
              key={tile.view}
              type="button"
              onClick={() => onNavigate?.(tile.view)}
              className="rounded-[var(--radius-xl)] p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{
                background: `var(--mod-${tile.color}-bg)`,
                color: `var(--mod-${tile.color})`,
              }}
            >
              <p className="text-sm font-semibold">{tile.label}</p>
              {counts[tile.view] != null && (
                <p className="mt-1 text-xs opacity-80">{counts[tile.view]}</p>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
