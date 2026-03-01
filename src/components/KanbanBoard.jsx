import { useState } from 'react'
import { useDragDrop } from '../hooks/useDragDrop'
import { TaskItem } from './TaskItem'

const COLUMN_STYLE = {
  backlog:     { headerColor: 'var(--muted)',    topAccent: null },
  in_progress: { headerGradient: true,           topAccent: 'var(--accent-gradient)' },
  done:        { headerColor: 'var(--success)',  topAccent: null },
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
        const cfg = COLUMN_STYLE[col.id] ?? COLUMN_STYLE.backlog
        const isDragOver = dragOverColumn === col.id
        return (
          <div
            key={col.id}
            className="min-w-0 rounded-[var(--radius-xl)] p-4 transition-all"
            style={{
              background: `var(--column-${col.id})`,
              border: isDragOver
                ? '1px solid var(--accent-ring)'
                : '1px solid var(--border)',
              boxShadow: isDragOver
                ? '0 0 0 1px var(--accent-ring), 0 0 20px rgba(124,58,237,0.15)'
                : undefined,
              ...(cfg.topAccent ? {
                borderTop: '2px solid transparent',
                backgroundImage: `${cfg.topAccent}, var(--column-${col.id})`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'border-box, padding-box',
              } : {}),
            }}
            onDragOver={(e) => onColumnDragOver(e, col.id)}
            onDragLeave={onColumnDragLeave}
            onDrop={(e) => onColumnDrop(e, col.id)}
          >
            <div
              className="mb-4 flex items-center justify-between pb-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={cfg.headerGradient ? {
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : { color: cfg.headerColor }}
              >
                {col.label}
              </h3>
              <span
                className="rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium tabular-nums"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}
              >
                {col.tasks.length}
              </span>
            </div>
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
