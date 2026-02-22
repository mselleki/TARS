import { useMemo } from 'react'
import { today } from '../utils/date'
import { TodayPanel } from './TodayPanel'
import { TaskItem } from './TaskItem'

export function TodayView({
  context,
  tasks = [],
  todayPlan,
  projects = [],
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onAddFocus,
  onRemoveFocus,
  onReorderFocus,
  onChoosePriorities,
  isSilentMode,
  selectedTaskId,
  onSelectTask,
  searchQuery = '',
}) {
  const focusTaskIds = todayPlan?.focusTaskIds ?? []
  const focusTasks = useMemo(() => {
    const byId = new Map(tasks.map((t) => [t.id, t]))
    return focusTaskIds.map((id) => byId.get(id)).filter(Boolean)
  }, [tasks, focusTaskIds])

  const todayTasks = useMemo(() => {
    const todayStr = today()
    return tasks
      .filter(
        (t) =>
          t.context === context &&
          t.status !== 'done' &&
          (t.doToday || (t.dueDate && t.dueDate.slice(0, 10) === todayStr))
      )
      .sort((a, b) => {
        const aFocus = focusTaskIds.indexOf(a.id)
        const bFocus = focusTaskIds.indexOf(b.id)
        if (aFocus !== -1 && bFocus !== -1) return aFocus - bFocus
        if (aFocus !== -1) return -1
        if (bFocus !== -1) return 1
        return (a.dueDate || '').localeCompare(b.dueDate || '')
      })
  }, [tasks, context, focusTaskIds])

  const isEmpty = focusTasks.length === 0

  return (
    <div className="space-y-8">
      <TodayPanel
        focusTasks={focusTasks}
        projects={projects}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onRemoveFocus={onRemoveFocus}
        onReorderFocus={onReorderFocus}
        onChoosePriorities={onChoosePriorities}
        isEmpty={isEmpty}
        isSilentMode={isSilentMode}
        selectedTaskId={selectedTaskId}
        onSelectTask={onSelectTask}
      />
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          À faire aujourd&apos;hui
        </h2>
        {todayTasks.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
            Aucune tâche à faire ou à échéance aujourd&apos;hui.
          </p>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  task={task}
                  projects={projects}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onAddFocus={onAddFocus}
                  onRemoveFocus={onRemoveFocus}
                  onSelect={onSelectTask}
                  selected={selectedTaskId === task.id}
                  isFocus={focusTaskIds.includes(task.id)}
                  searchQuery={searchQuery}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
