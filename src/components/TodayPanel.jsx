import { useState } from 'react'
import { MAX_FOCUS_TASKS } from '../constants'
import { useDragDrop } from '../hooks/useDragDrop'
import { TaskItem } from './TaskItem'

export function TodayPanel({
  focusTasks,
  projects = [],
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onRemoveFocus,
  onReorderFocus,
  onChoosePriorities,
  isEmpty,
  isSilentMode,
  selectedTaskId,
  onSelectTask,
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const { handleDragStart, handleDragEnd, handleDragOver, getDragPayload } = useDragDrop()
  const slots = Array.from({ length: MAX_FOCUS_TASKS }, (_, i) => focusTasks[i] ?? null)

  if (isEmpty) {
    return (
      <section className="mb-8 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/80 p-12 text-center">
        <p className="font-medium text-[var(--text-secondary)]">Choose your priorities for today</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Focus on up to {MAX_FOCUS_TASKS} tasks</p>
        <button
          type="button"
          onClick={onChoosePriorities}
          className="mt-6 rounded-[var(--radius-lg)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-2"
        >
          Choose your {MAX_FOCUS_TASKS} priorities <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">Ctrl+K</kbd>
        </button>
      </section>
    )
  }

  if (isSilentMode && focusTasks.length > 0) {
    const single = selectedTaskId && focusTasks.find((t) => t.id === selectedTaskId)
    const displayTask = single ?? focusTasks[0]
    return (
      <section className="mb-8">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
          {focusTasks.length > 1 && (
            <div className="mb-4 flex gap-2">
              {focusTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTask?.(t.id)}
                  className={`rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-[var(--transition)] ${
                    selectedTaskId === t.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  }`}
                >
                  {t.title.slice(0, 20)}{t.title.length > 20 ? '...' : ''}
                </button>
              ))}
            </div>
          )}
          <TaskItem
            task={displayTask}
            projects={projects}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRemoveFocus={onRemoveFocus}
            isFocus
            compact
          />
        </div>
      </section>
    )
  }

  const onSlotDragOver = (e, index) => {
    handleDragOver(e)
    setDragOverIndex(index)
  }

  const onSlotDrop = (e, toIndex) => {
    e.preventDefault()
    setDragOverIndex(null)
    const payload = getDragPayload(e)
    if (!payload || payload.fromIndex === toIndex) return
    onReorderFocus?.(payload.fromIndex, toIndex)
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Today
      </h2>
      <ul className="space-y-2">
        {slots.map((task, i) =>
          task ? (
            <li
              key={task.id}
              className={dragOverIndex === i ? 'rounded-[var(--radius-xl)] ring-2 ring-[var(--accent-ring)] bg-[var(--accent-subtle)]' : ''}
              onDragOver={(e) => onSlotDragOver(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => onSlotDrop(e, i)}
            >
              <TaskItem
                task={task}
                projects={projects}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onRemoveFocus={onRemoveFocus}
                isFocus
                isPrimaryFocus={i === 0}
                draggable
                onDragStart={(e) => handleDragStart(e, { taskId: task.id, fromIndex: i })}
                onDragEnd={handleDragEnd}
              />
            </li>
          ) : (
            <li
              key={`empty-${i}`}
              className={`flex min-h-[52px] items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] transition-[var(--transition)] ${
                dragOverIndex === i ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : ''
              }`}
              onDragOver={(e) => onSlotDragOver(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => onSlotDrop(e, i)}
            >
              <button
                type="button"
                onClick={onChoosePriorities}
                className="py-4 text-sm text-[var(--muted)] transition-[var(--transition)] hover:text-[var(--text-secondary)]"
              >
                + Add focus task
              </button>
            </li>
          )
        )}
      </ul>
    </section>
  )
}
