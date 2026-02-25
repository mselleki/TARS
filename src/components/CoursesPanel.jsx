import { useState, useRef, useEffect } from 'react'
import { buildProjectTree } from '../utils/projects'

const COURSES_PROJECT_TITLE = 'Courses'

export function CoursesPanel({
  projects = [],
  tasks = [],
  context,
  onAddProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [quickAdd, setQuickAdd] = useState('')

  const coursesProject = projects.find(
    (p) => p.context === context && p.title.toLowerCase() === COURSES_PROJECT_TITLE.toLowerCase()
  )
  const tree = coursesProject ? buildProjectTree(projects, coursesProject.id) : []
  const coursesTasks = tasks.filter(
    (t) => t.context === context && (t.projectId === coursesProject?.id || tree.some((n) => t.projectId === n.id))
  )
  const hasCourses = !!coursesProject
  const openCount = coursesTasks.filter((t) => t.status !== 'done').length
  const totalCount = coursesTasks.length

  const handleCreateList = () => {
    onAddProject?.({ title: COURSES_PROJECT_TITLE, context, parentProjectId: null })
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    const title = quickAdd.trim()
    if (!title || !coursesProject) return
    onAddTask?.({
      title,
      context,
      projectId: coursesProject.id,
      status: 'backlog',
      priority: 'low',
      energy: 'quick',
    })
    setQuickAdd('')
  }

  if (!hasCourses) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <svg className="h-4 w-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Courses
          </span>
          <button
            type="button"
            onClick={handleCreateList}
            className="rounded-[var(--radius-md)] bg-[var(--success)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Create list
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between border-b border-[var(--border)] px-4 py-3 text-left transition-[var(--transition)] hover:bg-[var(--bg)]/50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <svg className="h-4 w-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Courses
        </span>
        <span className="rounded-[var(--radius-sm)] bg-[var(--bg)] px-2 py-0.5 text-xs font-medium tabular-nums text-[var(--muted)]">
          {openCount}/{totalCount}
        </span>
      </button>
      {!collapsed && (
        <div className="p-4 space-y-3">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              placeholder="Add item…"
              className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--success)]"
            />
            <button
              type="submit"
              disabled={!quickAdd.trim()}
              className="rounded-[var(--radius-md)] bg-[var(--success)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              +
            </button>
          </form>
          {coursesTasks.length > 0 && (
            <ul className="space-y-1">
              {coursesTasks
                .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0))
                .slice(0, 8)
                .map((task) => (
                  <li key={task.id} className="group flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 hover:bg-[var(--bg)]">
                    <button
                      type="button"
                      onClick={() => onToggleTask?.(task.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        task.status === 'done' ? 'border-[var(--success)] bg-[var(--success)] text-white' : 'border-[var(--border)]'
                      }`}
                    >
                      {task.status === 'done' && (
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 truncate text-sm ${task.status === 'done' ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`}>
                      {task.title || '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTask?.(task.id)}
                      className="rounded p-1 text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--danger)]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
          )}
          {coursesTasks.length > 8 && (
            <p className="text-xs text-[var(--muted)]">+ {coursesTasks.length - 8} autres</p>
          )}
        </div>
      )}
    </section>
  )
}
