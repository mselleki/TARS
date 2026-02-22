import { useMemo } from 'react'
import { today, formatDate } from '../utils/date'

const DAYS_AHEAD = 14

export function PersoAgenda({
  tasks = [],
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}) {
  const tasksWithDueDate = useMemo(
    () => tasks.filter((t) => t.context === 'perso' && t.dueDate),
    [tasks]
  )

  const { byDate, sortedDates } = useMemo(() => {
    const todayStr = today()
    const map = new Map()
    for (let i = -1; i <= DAYS_AHEAD; i++) {
      const d = new Date(todayStr)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, [])
    }
    tasksWithDueDate.forEach((t) => {
      const key = String(t.dueDate).slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    })
    const sorted = Array.from(map.keys()).sort((a, b) => a.localeCompare(b))
    return { byDate: map, sortedDates: sorted }
  }, [tasksWithDueDate])

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <h2 className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
        Agenda
      </h2>
      <div className="divide-y divide-[var(--border)]">
        {sortedDates.map((dateStr) => {
          const dayTasks = byDate.get(dateStr) ?? []
          const isPast = dateStr < today()
          const isToday = dateStr === today()
          return (
            <div key={dateStr} className="px-4 py-3">
              <div className={`mb-2 text-xs font-medium ${isToday ? 'text-[var(--accent)]' : isPast ? 'text-[var(--muted)]' : 'text-[var(--text-secondary)]'}`}>
                {formatDate(dateStr)}
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">Aucune tâche</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayTasks
                    .filter((t) => t.status !== 'done')
                    .concat(dayTasks.filter((t) => t.status === 'done'))
                    .map((task) => (
                      <AgendaRow
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AgendaRow({ task, onToggle, onUpdate, onDelete }) {
  const isDone = task.status === 'done'

  return (
    <li className="group flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)]/50 px-3 py-2 hover:border-[var(--border-strong)]">
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        aria-label={isDone ? 'Marquer non faite' : 'Marquer faite'}
      >
        {isDone && (
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`min-w-0 flex-1 truncate text-sm ${isDone ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`}>
        {task.title || '—'}
      </span>
      <button
        type="button"
        onClick={() => onDelete?.(task.id)}
        className="rounded p-1 text-[var(--muted)] opacity-0 transition-opacity hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] group-hover:opacity-100"
        aria-label="Supprimer"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
