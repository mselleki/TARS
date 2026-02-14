import { useState } from 'react'

export function RitualBanner({ ritual, onComplete, onDismiss }) {
  const [showModal, setShowModal] = useState(false)
  const [answers, setAnswers] = useState(['', '', ''])

  const handleComplete = () => {
    onComplete?.(ritual.id, answers)
    setAnswers(['', '', ''])
    setShowModal(false)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">{ritual.name}</p>
          <p className="text-xs text-[var(--muted)]">Ritual due today</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
          >
            Start
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-[var(--radius-md)] px-2 py-1 text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)]"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-label="Ritual"
        >
          <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
            <h3 className="text-lg font-semibold text-[var(--text)]">{ritual.name}</h3>
            <div className="mt-4 space-y-3">
              {(ritual.questions ?? []).filter(Boolean).map((q, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">{q}</label>
                  <input
                    type="text"
                    value={answers[i] ?? ''}
                    onChange={(e) => {
                      const next = [...answers]
                      next[i] = e.target.value
                      setAnswers(next)
                    }}
                    className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    placeholder="Optional"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
