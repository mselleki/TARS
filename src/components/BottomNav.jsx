import { useState } from "react";
import { MODULES } from "../constants";

const PRIMARY_IDS = ["cockpit", "tasks", "projects"];

function NavItem({ module: m, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[56px] min-w-[56px] flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2"
      style={{ background: "transparent", border: "none" }}
      aria-current={isActive ? "page" : undefined}
      aria-label={m.label}
    >
      <span
        className="h-2.5 w-2.5 rounded-full transition-transform"
        style={{
          background: `var(--mod-${m.color})`,
          transform: isActive ? "scale(1.3)" : "scale(1)",
          opacity: isActive ? 1 : 0.45,
        }}
        aria-hidden
      />
      <span
        className="text-[10px] font-medium"
        style={{ color: isActive ? "var(--text)" : "var(--muted)" }}
      >
        {m.label}
      </span>
    </button>
  );
}

export function BottomNav({ view, onViewChange, onOpenQuickCapture }) {
  const [showMore, setShowMore] = useState(false);
  const primary = MODULES.filter((m) => PRIMARY_IDS.includes(m.id));
  const secondary = MODULES.filter((m) => !PRIMARY_IDS.includes(m.id));
  const moreActive = secondary.some((m) => m.id === view);

  const navigate = (id) => {
    setShowMore(false);
    onViewChange(id);
  };

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute inset-0 panel-backdrop-in"
            style={{ background: "rgba(28, 25, 23, 0.35)" }}
          />
          <div
            className="absolute bottom-[64px] left-3 right-3 rounded-[var(--radius-xl)] p-3 fade-in"
            style={{
              background: "var(--popover-bg)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {secondary.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(m.id)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-3 py-3 text-sm font-medium"
                  style={{
                    background:
                      view === m.id
                        ? `var(--mod-${m.color}-bg)`
                        : "var(--surface-2)",
                    color:
                      view === m.id
                        ? `var(--mod-${m.color})`
                        : "var(--text-secondary)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: `var(--mod-${m.color})` }}
                    aria-hidden
                  />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around md:hidden"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--border)",
        }}
        aria-label="Navigation"
      >
        <NavItem
          module={primary[0]}
          isActive={view === primary[0].id}
          onClick={() => navigate(primary[0].id)}
        />
        <NavItem
          module={primary[1]}
          isActive={view === primary[1].id}
          onClick={() => navigate(primary[1].id)}
        />

        {/* FAB capture rapide */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="-mt-5 flex h-14 w-14 shrink-0 touch-manipulation items-center justify-center rounded-full text-white"
          style={{
            background: "var(--accent-gradient)",
            boxShadow: "var(--accent-glow)",
          }}
          aria-label="Capture rapide (texte ou voix)"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <NavItem
          module={primary[2]}
          isActive={view === primary[2].id}
          onClick={() => navigate(primary[2].id)}
        />

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="relative flex min-h-[56px] min-w-[56px] flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2"
          style={{ background: "transparent", border: "none" }}
          aria-label="Plus de modules"
          aria-expanded={showMore}
        >
          <span className="flex gap-0.5" aria-hidden>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--muted)" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--muted)" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--muted)" }}
            />
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: moreActive ? "var(--text)" : "var(--muted)" }}
          >
            Plus
          </span>
        </button>
      </nav>
    </>
  );
}
