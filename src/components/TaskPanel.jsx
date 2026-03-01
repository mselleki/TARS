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
        className="panel-backdrop-in fixed inset-0 z-30 bg-black/60"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col touch-pan-y"
        style={{
          background: 'var(--panel-bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        aria-label="Task detail"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="truncate pr-2 text-base font-semibold"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            {task.title || 'Untitled'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-all"
            style={{ color: 'var(--muted)', background: 'transparent' }}
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {task.dueDate && (
          <div
            className="px-5 py-2 text-sm"
            style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Due: {formatDate(task.dueDate)}
          </div>
        )}
        <div className="flex-1 overflow-auto p-5">
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted)' }}
          >
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add a note…"
            maxLength={MAX_NOTE_LENGTH}
            rows={6}
            className="textarea-glass w-full resize-none px-4 py-3 text-sm"
          />
          <p className="mt-2 text-[11px]" style={{ color: 'var(--muted-2)' }}>
            {note.length}/{MAX_NOTE_LENGTH}
          </p>
        </div>
      </aside>
    </>
  )
}
