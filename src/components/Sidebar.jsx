import { VIEWS } from '../constants'

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

function NavButton({ viewId, label, isActive, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item w-full text-left border-none${isActive ? ' active' : ''}`}
      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-item-icon flex h-6 w-6 shrink-0 items-center justify-center">
        {ICONS[viewId] ?? ICONS.overview}
      </span>
      {!collapsed && (
        <span className="truncate" style={{ letterSpacing: '-0.01em' }}>{label}</span>
      )}
    </button>
  )
}

export function Sidebar({ view, onViewChange, collapsed = false }) {
  const primaryViews = VIEWS.filter((v) => v.primary)
  const secondaryViews = VIEWS.filter((v) => !v.primary)

  return (
    <aside
      className={`hidden shrink-0 flex-col transition-all md:flex`}
      style={{
        width: collapsed ? '56px' : '220px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
      aria-label="Navigation"
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-5"
        style={{ minHeight: '64px', justifyContent: collapsed ? 'center' : 'flex-start' }}
      >
        {collapsed ? (
          <span
            className="gradient-text font-bold text-lg"
            style={{ letterSpacing: '-0.03em' }}
          >
            T
          </span>
        ) : (
          <span
            className="gradient-text font-bold text-xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            TARS
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--sidebar-border)', marginBottom: '8px' }} />

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
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
          <div className="my-3 flex items-center gap-2 px-1">
            <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
            <span
              className="section-header px-1"
              style={{ fontSize: '9px', letterSpacing: '0.1em' }}
            >
              More
            </span>
            <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
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
