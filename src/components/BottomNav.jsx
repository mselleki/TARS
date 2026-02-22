import { VIEWS } from '../constants'

const ICONS = {
  overview: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  today: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  board: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  projects: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
}

export function BottomNav({ view, onViewChange }) {
  const items = VIEWS.filter((v) => ['overview', 'today', 'board', 'projects'].includes(v.id))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] safe-area-inset-bottom md:hidden"
      aria-label="Navigation"
    >
      {items.map((v) => {
        const isActive = view === v.id
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewChange(v.id)}
            className={`flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 transition-[var(--transition)] touch-manipulation ${
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--muted)] active:bg-[var(--border)]/30'
            }`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={v.label}
          >
            {ICONS[v.id] ?? ICONS.overview}
            <span className="text-[10px] font-medium">{v.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
