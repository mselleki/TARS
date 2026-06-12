import { MODULES, CONTEXTS } from "../constants";

function NavButton({ color, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item w-full border-none text-left${isActive ? " active" : ""}`}
      title={label}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <span
          className="h-2.5 w-2.5 rounded-full transition-transform"
          style={{
            background: `var(--mod-${color})`,
            transform: isActive ? "scale(1.25)" : "scale(1)",
          }}
          aria-hidden
        />
      </span>
      <span className="truncate" style={{ letterSpacing: "-0.01em" }}>
        {label}
      </span>
    </button>
  );
}

export function Sidebar({ view, onViewChange, context, onContextChange }) {
  const primary = MODULES.filter((m) => m.primary);
  const secondary = MODULES.filter((m) => !m.primary);

  return (
    <aside
      className="hidden w-[220px] shrink-0 flex-col md:flex"
      style={{
        background: "var(--sidebar-gradient)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      aria-label="Navigation"
    >
      <div
        className="flex items-center px-4 pt-5 pb-4"
        style={{ minHeight: "60px" }}
      >
        <span
          className="gradient-text text-xl font-bold"
          style={{ letterSpacing: "-0.03em" }}
        >
          TARS
        </span>
      </div>

      <div className="px-2 pb-3">
        <div
          className="flex rounded-[var(--radius-md)] p-0.5"
          style={{ background: "var(--surface-2)" }}
          role="group"
          aria-label="Contexte"
        >
          {CONTEXTS.map((ctx) => (
            <button
              key={ctx.value}
              type="button"
              onClick={() => onContextChange?.(ctx.value)}
              className="flex-1 rounded-[var(--radius-sm)] py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background:
                  context === ctx.value
                    ? "var(--surface-elevated)"
                    : "transparent",
                color: context === ctx.value ? "var(--accent)" : "var(--muted)",
                boxShadow: context === ctx.value ? "var(--shadow-sm)" : "none",
              }}
            >
              {ctx.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--sidebar-border)",
          marginBottom: "8px",
        }}
      />

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {primary.map((m) => (
          <NavButton
            key={m.id}
            color={m.color}
            label={m.label}
            isActive={view === m.id}
            onClick={() => onViewChange(m.id)}
          />
        ))}

        <div className="my-3 flex items-center gap-2 px-1">
          <div
            style={{
              height: "1px",
              flex: 1,
              background: "var(--sidebar-border)",
            }}
          />
          <span
            className="section-header px-1"
            style={{ fontSize: "9px", letterSpacing: "0.1em" }}
          >
            Modules
          </span>
          <div
            style={{
              height: "1px",
              flex: 1,
              background: "var(--sidebar-border)",
            }}
          />
        </div>

        {secondary.map((m) => (
          <NavButton
            key={m.id}
            color={m.color}
            label={m.label}
            isActive={view === m.id}
            onClick={() => onViewChange(m.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
