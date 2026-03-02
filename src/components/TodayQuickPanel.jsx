import { useMemo, useEffect } from 'react'
import { today } from '../utils/date'

function QuickTaskRow({ task, projectName, onToggle }) {
  const isDone = task.status === 'done'
  return (
    <li className="group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
          isDone
            ? 'checkbox-done border-transparent'
            : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
        }`}
        aria-label={isDone ? 'Mark undone' : 'Mark done'}
      >
        {isDone && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[13px] leading-snug"
          style={{
            color: isDone ? 'var(--muted)' : 'var(--text)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        {projectName && (
          <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--muted-2)' }}>
            {projectName}
          </p>
        )}
      </div>
    </li>
  )
}

export function TodayQuickPanel({ isOpen, onClose, tasks = [], todayPlan, projects = [], onToggle }) {
  const focusTaskIds = todayPlan?.focusTaskIds ?? []
  const todayStr = today()

  const focusTasks = useMemo(() => {
    const byId = new Map(tasks.map((t) => [t.id, t]))
    return focusTaskIds.map((id) => byId.get(id)).filter(Boolean)
  }, [tasks, focusTaskIds])

  const dueTodayTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status !== 'done' &&
          !focusTaskIds.includes(t.id) &&
          (t.doToday || (t.dueDate && t.dueDate.slice(0, 10) === todayStr))
      ),
    [tasks, focusTaskIds, todayStr]
  )

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const doneFocus = focusTasks.filter((t) => t.status === 'done').length
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  const projectMap = new Map(projects.map((p) => [p.id, p.title]))
  const hasAnything = focusTasks.length > 0 || dueTodayTasks.length > 0

  return (
    <>
      {/* Invisible backdrop — click anywhere to close */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className="panel-slide-left-in fixed top-0 z-40 flex flex-col overflow-hidden"
        style={{
          left: '220px',
          width: '280px',
          height: '100%',
          background: 'var(--panel-bg)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        aria-label="Today quick view"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.07em]"
              style={{ color: 'var(--muted)' }}
            >
              Today
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
            >
              {dateLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--muted)' }}
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-auto py-2">
          {!hasAnything && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Nothing planned for today.</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted-2)' }}>Add focus tasks from the Board.</p>
            </div>
          )}

          {focusTasks.length > 0 && (
            <div className="mb-3">
              <p className="section-header px-4 pb-1.5 pt-1">Focus</p>
              <ul>
                {focusTasks.map((task) => (
                  <QuickTaskRow
                    key={task.id}
                    task={task}
                    projectName={projectMap.get(task.projectId)}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
            </div>
          )}

          {dueTodayTasks.length > 0 && (
            <div>
              <p className="section-header px-4 pb-1.5 pt-1">Due today</p>
              <ul>
                {dueTodayTasks.map((task) => (
                  <QuickTaskRow
                    key={task.id}
                    task={task}
                    projectName={projectMap.get(task.projectId)}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        {focusTasks.length > 0 && (
          <div
            className="px-4 py-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {doneFocus} / {focusTasks.length} focus done
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
