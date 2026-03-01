export function EmptyState({ onAction, actionLabel = 'Create your first task', shortcut = 'N' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-2xl)]"
        style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 0 32px rgba(124,58,237,0.1)',
        }}
      >
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="url(#emptyGrad)"
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <p
        className="mt-6 text-center text-lg font-semibold"
        style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
      >
        No tasks yet
      </p>
      <p className="mt-2 max-w-sm text-center text-sm" style={{ color: 'var(--muted)' }}>
        Add a task to get started. Use keyboard shortcuts to move fast.
      </p>
      <button
        type="button"
        onClick={onAction}
        className="btn-primary mt-6 px-6 py-2.5 text-sm"
      >
        {actionLabel}
        <kbd className="ml-2 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-normal" style={{ background: 'rgba(255,255,255,0.15)' }}>
          {shortcut}
        </kbd>
      </button>
    </div>
  )
}

export function SearchEmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)]"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
        }}
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="mt-4 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        No tasks match your search
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-sm font-medium transition-all"
        style={{ color: 'var(--muted)' }}
      >
        Clear search
      </button>
    </div>
  )
}
