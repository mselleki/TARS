import { VIEWS, CONTEXTS } from '../constants'

const ICONS = {
  overview: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  today: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  board: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  projects: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  rituals: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

function NavButton({ viewId, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item w-full text-left border-none${isActive ? ' active' : ''}`}
      title={label}
    >
      <span className="sidebar-item-icon flex h-6 w-6 shrink-0 items-center justify-center">
        {ICONS[viewId] ?? ICONS.overview}
      </span>
      <span className="truncate" style={{ letterSpacing: '-0.01em' }}>{label}</span>
    </button>
  )
}

export function Sidebar({ view, onViewChange, context, onContextChange, onOpenTodayPanel, collapsed = false }) {
  // Exclude 'today' from regular nav — it's a quick-panel button instead
  const navViews = VIEWS.filter((v) => v.id !== 'today')
  const primaryViews = navViews.filter((v) => v.primary)
  const secondaryViews = navViews.filter((v) => !v.primary)

  return (
    <aside
      className={`hidden shrink-0 flex-col transition-all md:flex`}
      style={{
        width: collapsed ? '56px' : '220px',
        background: 'var(--sidebar-gradient)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
      aria-label="Navigation"
    >
      {/* Logo */}
      <div className="flex items-center px-4 pt-5 pb-4" style={{ minHeight: '60px' }}>
        <span
          className="gradient-text font-bold text-xl"
          style={{ letterSpacing: '-0.03em' }}
        >
          {collapsed ? 'T' : 'TARS'}
        </span>
      </div>

      {/* Context switcher — Pro / Perso */}
      {!collapsed && (
        <div className="px-2 pb-3">
          <div
            className="flex rounded-[var(--radius-md)] p-0.5"
            style={{ background: 'var(--surface-2)' }}
            role="group"
            aria-label="Context"
          >
            {CONTEXTS.map((ctx) => (
              <button
                key={ctx.value}
                type="button"
                onClick={() => onContextChange?.(ctx.value)}
                className="flex-1 rounded-[var(--radius-sm)] py-1.5 text-[12px] font-semibold transition-all"
                style={{
                  background: context === ctx.value ? 'var(--surface-elevated)' : 'transparent',
                  color: context === ctx.value ? 'var(--accent)' : 'var(--muted)',
                  boxShadow: context === ctx.value ? 'var(--shadow-sm)' : 'none',
                  letterSpacing: '0.01em',
                }}
              >
                {ctx.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--sidebar-border)', marginBottom: '8px' }} />

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {/* Regular primary views */}
        {primaryViews.map((v) => (
          <NavButton
            key={v.id}
            viewId={v.id}
            label={v.label}
            isActive={view === v.id}
            onClick={() => onViewChange(v.id)}
          />
        ))}

        {/* Today — quick panel button, visually distinct */}
        <button
          type="button"
          onClick={onOpenTodayPanel}
          className="sidebar-item w-full border-none text-left"
          title="Today quick view"
        >
          <span className="sidebar-item-icon flex h-6 w-6 shrink-0 items-center justify-center">
            {ICONS.today}
          </span>
          {!collapsed && (
            <span className="truncate" style={{ letterSpacing: '-0.01em' }}>Today</span>
          )}
          {!collapsed && (
            <span
              className="ml-auto rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: 'var(--surface-elevated)', color: 'var(--muted-2)' }}
            >
              quick
            </span>
          )}
        </button>

        {secondaryViews.length > 0 && (
          <div className="my-3 flex items-center gap-2 px-1">
            <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
            {!collapsed && (
              <span
                className="section-header px-1"
                style={{ fontSize: '9px', letterSpacing: '0.1em' }}
              >
                More
              </span>
            )}
            <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
          </div>
        )}

        {secondaryViews.map((v) => (
          <NavButton
            key={v.id}
            viewId={v.id}
            label={v.label}
            isActive={view === v.id}
            onClick={() => onViewChange(v.id)}
          />
        ))}
      </nav>
    </aside>
  )
}
