import { useState } from 'react'
import { useDragDrop } from '../hooks/useDragDrop'
import { TaskItem } from './TaskItem'

const COLUMN_CONFIG = {
  backlog: { accent: '', header: 'text-[var(--muted)]' },
  in_progress: { accent: 'border-t-[3px] border-t-[var(--accent)]', header: 'text-[var(--accent)] font-semibold' },
  done: { accent: '', header: 'text-[var(--muted)]' },
}

export function KanbanBoard({
  columns,
  projects = [],
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onTaskSelect,
  viewMode = 'cards',
  searchQuery = '',
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const { handleDragStart, handleDragEnd, handleDragOver, getDragPayload } = useDragDrop()

  const onTaskDragStart = (e, taskId, fromStatus) => {
    handleDragStart(e, { taskId, fromStatus })
  }

  const onColumnDragOver = (e, colId) => {
    handleDragOver(e)
    setDragOverColumn(colId)
  }

  const onColumnDragLeave = () => setDragOverColumn(null)

  const onColumnDrop = (e, toStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const payload = getDragPayload(e)
    if (!payload || payload.fromStatus === toStatus) return
    onStatusChange(payload.taskId, toStatus)
  }

  const allTasks = columns.flatMap((col) => col.tasks)

  if (viewMode === 'list') {
    return (
      <ul className="space-y-2">
        {allTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projects={projects}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onSelect={onTaskSelect}
            compact
            searchQuery={searchQuery}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)_minmax(280px,1fr)]">
      {columns.map((col) => {
        const config = COLUMN_CONFIG[col.id] ?? COLUMN_CONFIG.backlog
        const isDragOver = dragOverColumn === col.id
        return (
          <div
            key={col.id}
            className={`min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] p-4 transition-[var(--transition)] ${config.accent} ${
              isDragOver ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''
            }`}
            style={{ backgroundColor: `var(--column-${col.id})` }}
            onDragOver={(e) => onColumnDragOver(e, col.id)}
            onDragLeave={onColumnDragLeave}
            onDrop={(e) => onColumnDrop(e, col.id)}
          >
            <h3 className={`mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs uppercase tracking-wider ${config.header}`}>
              <span>{col.label}</span>
              <span className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--muted)]">
                {col.tasks.length}
              </span>
            </h3>
            <ul className="min-h-[80px] space-y-2">
              {col.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={projects}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onSelect={onTaskSelect}
                  draggable
                  onDragStart={(e) => onTaskDragStart(e, task.id, task.status)}
                  onDragEnd={handleDragEnd}
                  searchQuery={searchQuery}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
