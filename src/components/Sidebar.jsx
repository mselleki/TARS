import { VIEWS } from '../constants'

const ICONS = {
  overview: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  today: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  board: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  projects: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  rituals: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

function NavButton({ viewId, label, isActive, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-[var(--transition)] ${
        isActive
          ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
          : 'text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]'
      }`}
      title={label}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-[var(--transition)] ${
          isActive ? 'bg-[var(--accent)] text-white' : 'group-hover:bg-[var(--border)] text-current'
        }`}
      >
        {ICONS[viewId] ?? ICONS.overview}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

export function Sidebar({ view, onViewChange, collapsed = false }) {
  const primaryViews = VIEWS.filter((v) => v.primary)
  const secondaryViews = VIEWS.filter((v) => !v.primary)

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-[2px_0_12px_rgba(0,0,0,0.04)] transition-all ${
        collapsed ? 'w-14' : 'w-52'
      }`}
      aria-label="Navigation"
    >
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {primaryViews.map((v) => (
          <NavButton
            key={v.id}
            viewId={v.id}
            label={v.label}
            isActive={view === v.id}
            collapsed={collapsed}
            onClick={() => onViewChange(v.id)}
          />
        ))}

        {!collapsed && secondaryViews.length > 0 && (
          <div className="my-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="px-1 text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]">
              Views
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
        )}

        {secondaryViews.map((v) => (
          <NavButton
            key={v.id}
            viewId={v.id}
            label={v.label}
            isActive={view === v.id}
            collapsed={collapsed}
            onClick={() => onViewChange(v.id)}
          />
        ))}
      </nav>
    </aside>
  )
}
