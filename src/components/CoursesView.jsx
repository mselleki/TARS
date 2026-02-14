import { useState, useRef, useEffect } from 'react'
import { buildProjectTree } from '../utils/projects'

const COURSES_PROJECT_TITLE = 'Courses'

export function CoursesView({
  projects = [],
  tasks = [],
  context,
  onAddProject,
  onAddSubProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) {
  const [quickAdd, setQuickAdd] = useState('')
  const inputRef = useRef(null)

  const coursesProject = projects.find(
    (p) => p.context === context && p.title.toLowerCase() === COURSES_PROJECT_TITLE.toLowerCase()
  )
  const tree = coursesProject ? buildProjectTree(projects, coursesProject.id) : []
  const coursesTasks = tasks.filter(
    (t) => t.context === context && (t.projectId === coursesProject?.id || tree.some((n) => t.projectId === n.id))
  )
  const hasCourses = !!coursesProject

  useEffect(() => {
    if (hasCourses && inputRef.current) {
      inputRef.current.focus()
    }
  }, [hasCourses])

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

  const handleAddToCategory = (categoryProjectId) => {
    const title = quickAdd.trim()
    if (!title) return
    onAddTask?.({
      title,
      context,
      projectId: categoryProjectId,
      status: 'backlog',
      priority: 'low',
      energy: 'quick',
    })
    setQuickAdd('')
  }

  if (!hasCourses) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-subtle)]">
            <svg className="h-8 w-8 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Liste de courses</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Créez votre liste pour ne rien oublier au supermarché.
          </p>
          <button
            type="button"
            onClick={handleCreateList}
            className="mt-6 rounded-[var(--radius-lg)] bg-[var(--success)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:opacity-90"
          >
            Créer ma liste
          </button>
        </div>
      </div>
    )
  }

  const rootTasks = coursesTasks.filter((t) => t.projectId === coursesProject.id)
  const totalItems = coursesTasks.length
  const checkedItems = coursesTasks.filter((t) => t.status === 'done').length

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--success)]/30 bg-[var(--success-subtle)]/50 px-4 py-3">
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            placeholder="Ajouter un article…"
            className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--success)] focus:ring-1 focus:ring-[var(--success)]/30"
            aria-label="Ajouter un article"
          />
          <button
            type="submit"
            disabled={!quickAdd.trim()}
            className="rounded-[var(--radius-md)] bg-[var(--success)] px-4 py-2.5 text-sm font-medium text-white transition-[var(--transition)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </form>
        {totalItems > 0 && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {checkedItems}/{totalItems} cochés
          </p>
        )}
      </div>

      {tree.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">Ajouter dans :</span>
          {tree.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleAddToCategory(cat.id)}
              disabled={!quickAdd.trim()}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-[var(--transition)] hover:border-[var(--success)] hover:text-[var(--success)] disabled:opacity-50"
            >
              + {cat.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const name = window.prompt('Nom de la catégorie (ex: Fruits, Légumes)')
              if (name?.trim()) onAddSubProject?.(coursesProject.id, name.trim().replace(/^\+ /, ''))
            }}
            className="rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] transition-[var(--transition)] hover:border-[var(--success)] hover:text-[var(--success)]"
          >
            + Catégorie
          </button>
        </div>
      )}

      {tree.length === 0 && coursesTasks.length > 0 && (
        <button
          type="button"
          onClick={() => {
            const name = window.prompt('Nom de la catégorie (ex: Fruits, Légumes)')
            if (name?.trim()) onAddSubProject?.(coursesProject.id, name.trim())
          }}
          className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition-[var(--transition)] hover:border-[var(--success)] hover:text-[var(--success)]"
        >
          + Créer une catégorie pour organiser
        </button>
      )}

      <div className="space-y-4">
        {tree.map((category) => {
          const catTasks = coursesTasks.filter((t) => t.projectId === category.id)
          if (catTasks.length === 0) return null
          return (
            <section key={category.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--success)]">
                {category.title}
              </h3>
              <ul className="space-y-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2">
                {catTasks
                  .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0))
                  .map((task) => (
                    <CourseItem
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask?.(task.id)}
                      onUpdate={(up) => onUpdateTask?.(task.id, up)}
                      onDelete={() => onDeleteTask?.(task.id)}
                    />
                  ))}
              </ul>
            </section>
          )
        })}

        {rootTasks.length > 0 && (
          <section>
            {tree.length > 0 && (
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Divers
              </h3>
            )}
            <ul className="space-y-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2">
              {rootTasks
                .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0))
                .map((task) => (
                  <CourseItem
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask?.(task.id)}
                    onUpdate={(up) => onUpdateTask?.(task.id, up)}
                    onDelete={() => onDeleteTask?.(task.id)}
                  />
                ))}
            </ul>
          </section>
        )}
      </div>

      {coursesTasks.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--muted)]">
          Commencez à ajouter des articles avec le champ ci-dessus.
        </p>
      )}
    </div>
  )
}

function CourseItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(task.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = () => {
    const t = value.trim()
    if (t) onUpdate({ title: t })
    setEditing(false)
  }

  const isDone = task.status === 'done'

  return (
    <li className="group flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 transition-[var(--transition)] hover:bg-[var(--bg)]">
      <button
        type="button"
        onClick={() => onToggle()}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border-2 transition-[var(--transition)] ${
          isDone
            ? 'border-[var(--success)] bg-[var(--success)] text-white'
            : 'border-[var(--border-strong)] text-transparent hover:border-[var(--success)]'
        }`}
        aria-label={isDone ? 'Décocher' : 'Cocher'}
      >
        {isDone && (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="min-w-0 flex-1 rounded border border-[var(--border)] px-2 py-0.5 text-sm outline-none focus:border-[var(--success)]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`min-w-0 flex-1 truncate text-left text-sm ${isDone ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`}
        >
          {task.title || 'Sans titre'}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete()}
        className="rounded p-1 text-[var(--muted)] opacity-0 transition-[var(--transition)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] group-hover:opacity-100"
        aria-label="Supprimer"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
