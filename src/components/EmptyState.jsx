export function EmptyState({ onAction, actionLabel = 'Create your first task', shortcut = 'N' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--surface)]">
        <svg
          className="h-8 w-8 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <p className="mt-6 text-center text-lg font-semibold text-[var(--text)]">
        No tasks yet
      </p>
      <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted)]">
        Add a task to get started. Use keyboard shortcuts to move fast.
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 rounded-[var(--radius-lg)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-2"
      >
        {actionLabel}{' '}
        <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">
          {shortcut}
        </kbd>
      </button>
    </div>
  )
}

export function SearchEmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--surface)]">
        <svg
          className="h-6 w-6 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <p className="mt-4 text-center text-sm font-medium text-[var(--text-secondary)]">
        No tasks match your search
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-sm font-medium text-[var(--muted)] underline decoration-[var(--border)] underline-offset-2 transition-[var(--transition)] hover:text-[var(--text)]"
      >
        Clear search
      </button>
    </div>
  )
}
