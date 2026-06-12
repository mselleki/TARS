export function ModuleHeader({ color, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: `var(--mod-${color})` }}
        aria-hidden
      />
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      {subtitle && (
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
