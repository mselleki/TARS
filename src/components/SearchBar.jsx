import { useRef, useImperativeHandle, forwardRef } from 'react'

export const SearchBar = forwardRef(function SearchBar(
  { value, onChange, onClear, placeholder = 'Search...' },
  ref
) {
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  return (
    <div className="relative flex items-center">
      <svg
        className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-glass min-h-[38px] w-full touch-manipulation rounded-[var(--radius-lg)] py-2 pl-10 pr-10 text-sm outline-none sm:min-h-0"
        aria-label="Search tasks"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 rounded-full p-1.5 text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)] hover:text-[var(--text)]"
          aria-label="Clear search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
})
