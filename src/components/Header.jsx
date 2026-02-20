import { useState } from 'react'
import { CONTEXTS, DOMAINS, COUNTRIES, BUSINESSES, DOMAIN_LABELS } from '../constants'
import { SearchBar } from './SearchBar'

const SHORTCUTS = [
  { keys: 'Ctrl+K', label: 'New task' },
  { keys: '/', label: 'Search' },
  { keys: 'O', label: 'Overview' },
]

export function Header({
  context,
  onContextChange,
  searchQuery,
  onSearchChange,
  searchResultsCount,
  searchRef,
  view = 'overview',
  ticketFilters = {},
  onTicketFiltersChange,
  onInstallClick,
  canInstall,
  isSilentMode,
  onToggleSilentMode,
  isDarkMode = false,
  onToggleDarkMode = () => {},
}) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto max-w-4xl px-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3.5">
          <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-4">
            <h1 className="truncate text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
              Organizer
            </h1>
            <div className="hidden h-4 w-px bg-[var(--border)] sm:block" aria-hidden />
            <div
              role="group"
              aria-label="Context"
              className="flex shrink-0 rounded-[var(--radius-md)] bg-[var(--bg)] p-0.5 sm:p-1"
            >
              {CONTEXTS.map((ctx) => (
                <button
                  key={ctx.value}
                  type="button"
                  onClick={() => onContextChange(ctx.value)}
                  className={`min-h-[44px] min-w-[44px] touch-manipulation rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-[var(--transition)] sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
                    context === ctx.value
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)] border border-[var(--border)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--border)]/50'
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto sm:flex-initial">
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none md:w-56">
              <SearchBar
                ref={searchRef}
                value={searchQuery}
                onChange={onSearchChange}
                onClear={() => onSearchChange('')}
                placeholder="Search..."
              />
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setShowShortcuts((s) => !s)}
                  onBlur={() => setTimeout(() => setShowShortcuts(false), 150)}
                  className="flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)] hover:text-[var(--text)]"
                  aria-label="Keyboard shortcuts"
                  title="Keyboard shortcuts"
                >
                  <kbd className="font-mono text-[10px]">?</kbd>
                </button>
                {showShortcuts && (
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-52 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] py-2 shadow-[var(--shadow-lg)]">
                    {SHORTCUTS.map((s) => (
                      <div key={s.keys} className="flex items-center justify-between px-3 py-1 text-xs">
                        <span className="text-[var(--text-secondary)]">{s.label}</span>
                        <kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">
                          {s.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)] hover:text-[var(--text)] active:bg-[var(--border)]/70"
                aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={onToggleSilentMode}
                className={`min-h-[44px] touch-manipulation rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium transition-[var(--transition)] sm:min-h-0 sm:px-2.5 sm:py-1.5 ${
                  isSilentMode
                    ? 'bg-[var(--text-secondary)] text-white'
                    : 'text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)] active:bg-[var(--border)]/70'
                }`}
                aria-label={isSilentMode ? 'Exit silence mode' : 'Silence mental mode'}
              >
                {isSilentMode ? 'Exit' : 'Silence'}
              </button>
              {canInstall && (
                <button
                  type="button"
                  onClick={onInstallClick}
                  className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] p-2 text-[var(--text-secondary)] transition-[var(--transition)] hover:bg-[var(--border)] hover:text-[var(--text)] active:bg-[var(--border)]/70 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5"
                  aria-label="Install app"
                >
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {view === 'overview' && context === 'pro' && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] py-2 sm:gap-3 sm:py-2.5">
            <button
              type="button"
              onClick={() => setFiltersExpanded((e) => !e)}
              className={`min-h-[44px] touch-manipulation rounded-[var(--radius-md)] px-3 py-2 text-[11px] font-medium transition-[var(--transition)] sm:min-h-0 sm:py-1.5 ${
                filtersExpanded ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--border)]/50'
              }`}
              aria-expanded={filtersExpanded}
            >
              Filters
            </button>
            {filtersExpanded && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={ticketFilters.business ?? ''}
                  onChange={(e) => onTicketFiltersChange?.({ ...ticketFilters, business: e.target.value || null })}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px]"
                  aria-label="Business"
                >
                  <option value="">Business</option>
                  {BUSINESSES.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
                <select
                  value={ticketFilters.domain ?? ''}
                  onChange={(e) => onTicketFiltersChange?.({ ...ticketFilters, domain: e.target.value || null })}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px]"
                  aria-label="Domain"
                >
                  <option value="">Domain</option>
                  {DOMAINS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ticketFilters.owner ?? ''}
                  onChange={(e) => onTicketFiltersChange?.({ ...ticketFilters, owner: e.target.value || null })}
                  placeholder="Owner"
                  className="w-24 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px]"
                  aria-label="Owner"
                />
                <select
                  value={ticketFilters.countryId ?? ''}
                  onChange={(e) => onTicketFiltersChange?.({ ...ticketFilters, countryId: e.target.value || null })}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px]"
                  aria-label="Country"
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {searchQuery && (
          <p className="border-t border-[var(--border)] py-2 text-xs text-[var(--muted)]">
            {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </header>
  )
}
