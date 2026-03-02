import { useState } from 'react'
import { SearchBar } from './SearchBar'

const SHORTCUTS = [
  { keys: 'Ctrl+K', label: 'New task' },
  { keys: '/', label: 'Search' },
  { keys: 'O', label: 'Overview' },
]

export function Header({
  searchQuery,
  onSearchChange,
  searchResultsCount,
  searchRef,
  onInstallClick,
  canInstall,
  isSilentMode,
  onToggleSilentMode,
  isDarkMode = false,
  onToggleDarkMode = () => {},
  syncStatus = 'idle',
}) {
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <header
      className="sticky top-0 z-10"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-end gap-2 py-2.5 sm:gap-3">

          {/* Search */}
          <div className="min-w-0 flex-1 sm:w-52 sm:flex-none md:w-64">
            <SearchBar
              ref={searchRef}
              value={searchQuery}
              onChange={onSearchChange}
              onClear={() => onSearchChange('')}
              placeholder="Search…"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">

            {/* Sync status */}
            {syncStatus !== 'idle' && (
              <span
                className="flex items-center"
                title={syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'ok' ? 'Synced' : 'Sync error'}
                style={{ color: syncStatus === 'ok' ? 'var(--success)' : 'var(--muted)' }}
              >
                {syncStatus === 'syncing' && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {syncStatus === 'ok' && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {syncStatus === 'error' && (
                  <svg className="h-4 w-4" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </span>
            )}

            {/* Keyboard shortcuts */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowShortcuts((s) => !s)}
                onBlur={() => setTimeout(() => setShowShortcuts(false), 150)}
                className="flex items-center rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs font-medium transition-all"
                style={{ color: 'var(--muted)' }}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
              >
                <kbd className="font-mono text-[11px]">?</kbd>
              </button>
              {showShortcuts && (
                <div
                  className="absolute right-0 top-full z-20 mt-2 w-52 rounded-[var(--radius-xl)] py-2"
                  style={{
                    background: 'var(--popover-bg)',
                    border: '1px solid var(--border-strong)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {SHORTCUTS.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                      <kbd
                        className="rounded-[var(--radius-sm)] px-1.5 py-0.5 font-mono text-[10px]"
                        style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                      >
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] p-2 transition-all"
              style={{ color: 'var(--muted)' }}
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Silence mode */}
            <button
              type="button"
              onClick={onToggleSilentMode}
              className="min-h-[36px] touch-manipulation rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-all sm:min-h-0"
              style={{
                background: isSilentMode ? 'var(--accent-subtle)' : 'transparent',
                color: isSilentMode ? 'var(--accent)' : 'var(--muted)',
                border: isSilentMode ? '1px solid var(--accent-ring)' : '1px solid transparent',
              }}
              aria-label={isSilentMode ? 'Exit silence mode' : 'Silence mental mode'}
            >
              {isSilentMode ? '× Exit' : 'Silence'}
            </button>

            {/* Install PWA */}
            {canInstall && (
              <button
                type="button"
                onClick={onInstallClick}
                className="flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] p-2 transition-all sm:min-h-0 sm:px-3 sm:py-1.5"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                aria-label="Install app"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search results count */}
        {searchQuery && (
          <p
            className="py-1.5 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </header>
  )
}
