import { useState, useEffect, useRef } from 'react'
import { formatDate } from '../utils/date'
import { MAX_NOTE_LENGTH } from '../constants'

const SWIPE_THRESHOLD_PX = 60

export function TaskPanel({ task, onClose, onUpdate }) {
  const [note, setNote] = useState(task?.note ?? '')
  const touchStartX = useRef(0)

  useEffect(() => {
    setNote(task?.note ?? '')
  }, [task?.id, task?.note])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX
    if (endX - touchStartX.current > SWIPE_THRESHOLD_PX) onClose?.()
  }

  const handleBlur = () => {
    const trimmed = String(note).trim().slice(0, MAX_NOTE_LENGTH)
    if (trimmed !== (task?.note ?? '')) {
      onUpdate?.(task.id, { note: trimmed })
    }
  }

  if (!task) return null

  return (
    <>
      <div
        className="panel-backdrop-in fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] touch-pan-y"
        aria-label="Détail de la tâche"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="truncate pr-2 text-base font-semibold text-[var(--text)]">
            {task.title || 'Sans titre'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {task.dueDate && (
          <div className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">
            Échéance : {formatDate(task.dueDate)}
          </div>
        )}
        <div className="flex-1 overflow-auto p-4">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="Ajouter une note..."
            maxLength={MAX_NOTE_LENGTH}
            rows={6}
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {note.length}/{MAX_NOTE_LENGTH}
          </p>
        </div>
      </aside>
    </>
  )
}
