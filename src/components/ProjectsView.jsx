import { useState } from 'react'
import { buildProjectTree } from '../utils/projects'
import { TaskItem } from './TaskItem'

function ProjectNode({
  node,
  tasks,
  projects,
  context,
  onAddSubProject,
  onAddTask,
  onUpdateProject,
  onDeleteProject,
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onAddFocus,
  onRemoveFocus,
  focusIds,
  level = 0,
}) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(node.title)
  const projectTasks = tasks.filter((t) => t.projectId === node.id)
  const hasChildren = node.children?.length > 0

  const handleSaveTitle = () => {
    const t = editValue.trim()
    if (t) onUpdateProject(node.id, { title: t })
    setEditing(false)
  }

  return (
    <div className="mb-4" style={{ marginLeft: level * 20 }}>
      <div
        className={`flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 ${
          level > 0 ? 'border-l-4 border-l-[var(--accent)]/50' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)]"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="w-4" />
          )}
        </button>

        {editing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none focus:border-[var(--accent)]"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditValue(node.title)
              setEditing(true)
            }}
            className="flex-1 text-left text-sm font-semibold text-[var(--text)] transition-[var(--transition)] hover:text-[var(--accent)]"
          >
            {node.title}
          </button>
        )}

        <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
          {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
        </span>

        <div className="flex gap-1">
          {level === 0 && (
            <button
              type="button"
              onClick={() => onAddSubProject(node.id)}
              className="rounded-[var(--radius-md)] px-2 py-1 text-xs text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)] hover:text-[var(--text)]"
              title="Add sub-project"
            >
              + Sub
            </button>
          )}
          <button
            type="button"
            onClick={() => onAddTask(node.id)}
            className="rounded-[var(--radius-md)] px-2 py-1 text-xs text-[var(--accent)] transition-[var(--transition)] hover:bg-[var(--accent-subtle)]"
            title="Add task"
          >
            + Task
          </button>
          <button
            type="button"
            onClick={() => onDeleteProject(node.id)}
            className="rounded-[var(--radius-md)] px-2 py-1 text-xs text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
            title="Delete project"
          >
            ×
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <ul className="mt-2 space-y-2 pl-4">
            {projectTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onAddFocus={onAddFocus}
                onRemoveFocus={onRemoveFocus}
                isFocus={focusIds.includes(task.id)}
              />
            ))}
          </ul>
          {node.children?.map((child) => (
            <ProjectNode
              key={child.id}
              node={child}
              tasks={tasks}
              projects={projects}
              context={context}
              onAddSubProject={onAddSubProject}
              onAddTask={onAddTask}
              onUpdateProject={onUpdateProject}
              onDeleteProject={onDeleteProject}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddFocus={onAddFocus}
              onRemoveFocus={onRemoveFocus}
              focusIds={focusIds}
              level={level + 1}
            />
          ))}
        </>
      )}
    </div>
  )
}

export function ProjectsView({
  projects,
  tasks,
  context,
  onAddProject,
  onAddSubProject,
  onUpdateProject,
  onDeleteProject,
  onAddTask,
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onAddFocus,
  onRemoveFocus,
  focusIds,
}) {
  const tree = buildProjectTree(projects.filter((p) => p.context === context))
  const tasksWithoutProject = tasks.filter((t) => t.context === context && !t.projectId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">Projects</h2>
        <button
          type="button"
          onClick={() => onAddProject()}
          className="rounded-[var(--radius-lg)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
        >
          + New project
        </button>
      </div>

      {tree.length === 0 && tasksWithoutProject.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/80 p-12 text-center">
          <p className="text-[var(--muted)]">No projects yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create a project to organize your work by client, phase, or theme.
          </p>
          <button
            type="button"
            onClick={() => onAddProject()}
            className="mt-6 rounded-[var(--radius-lg)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
          >
            + Create first project
          </button>
        </div>
      ) : (
        <>
          {tree.map((node) => (
            <ProjectNode
              key={node.id}
              node={node}
              tasks={tasks}
              projects={projects}
              context={context}
              onAddSubProject={onAddSubProject}
              onAddTask={onAddTask}
              onUpdateProject={onUpdateProject}
              onDeleteProject={onDeleteProject}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddFocus={onAddFocus}
              onRemoveFocus={onRemoveFocus}
              focusIds={focusIds}
            />
          ))}

          {tasksWithoutProject.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Without project
              </h3>
              <ul className="space-y-2">
                {tasksWithoutProject.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    projects={projects}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onAddFocus={onAddFocus}
                    onRemoveFocus={onRemoveFocus}
                    isFocus={focusIds.includes(task.id)}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
