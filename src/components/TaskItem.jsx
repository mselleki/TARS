import { useState, useRef, useEffect } from 'react'
import { PRIORITIES, DOMAINS, COUNTRIES, MAX_NOTE_LENGTH } from '../constants'
import { formatDate, today } from '../utils/date'
import { flattenProjectsForSelect } from '../utils/projects'


export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onAddFocus,
  onRemoveFocus,
  onSelect,
  isFocus,
  isPrimaryFocus,
  selected,
  compact,
  draggable,
  onDragStart,
  onDragEnd,
  projects = [],
}) {
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef(null)

  const priority = PRIORITIES.find((p) => p.value === task.priority) ?? PRIORITIES[1]
  const isOverdue = task.dueDate && task.dueDate < today() && task.status !== 'done'

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      if (editingField === 'title') inputRef.current.select()
    }
  }, [editingField])

  const startEdit = (field, value) => {
    setEditingField(field)
    setEditValue(Array.isArray(value) ? value : (value ?? ''))
  }

  const toggleDomain = (val) => {
    const arr = task.domainIds ?? []
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
    onUpdate(task.id, { domainIds: next })
  }
  const toggleCountry = (val) => {
    const arr = task.countryIds ?? []
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
    onUpdate(task.id, { countryIds: next })
  }

  const saveEdit = () => {
    if (editingField === 'title') {
      const trimmed = String(editValue).trim()
      if (trimmed) onUpdate(task.id, { title: trimmed })
    } else if (editingField === 'dueDate') {
      onUpdate(task.id, { dueDate: editValue || '' })
    } else if (editingField === 'priority') {
      onUpdate(task.id, { priority: editValue })
    } else if (editingField === 'note') {
      onUpdate(task.id, { note: String(editValue).slice(0, MAX_NOTE_LENGTH) })
    } else if (editingField === 'project') {
      onUpdate(task.id, { projectId: editValue || null })
    } else if (editingField === 'domain') {
      onUpdate(task.id, { domainIds: editValue })
    } else if (editingField === 'country') {
      onUpdate(task.id, { countryIds: editValue })
    }
    setEditingField(null)
  }

  const cancelEdit = () => setEditingField(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') cancelEdit()
  }

  const isDone = task.status === 'done'
  const isInProgress = task.status === 'in_progress'
  const isBacklog = task.status === 'backlog'

  const leftBar = isDone ? 'border-l-[var(--muted)]' : task.doToday ? 'border-l-[var(--danger)]' : isOverdue ? 'border-l-[var(--danger)]' : task.priority === 'high' ? 'border-l-[var(--accent)]' : 'border-l-[var(--border)]'

  const baseClasses = `group flex min-w-0 flex-wrap items-start gap-3 overflow-visible rounded-[var(--radius-lg)] border border-[var(--border)] border-l-2 bg-[var(--surface)] px-3 py-2.5 transition-[var(--transition)] ${
    isDone
      ? 'opacity-90'
      : ''
  } shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] ${
    selected || (isFocus && !isDone) ? 'ring-2 ring-[var(--accent-ring)] ring-offset-2 shadow-[var(--shadow-md)]' : ''
  } ${leftBar} ${editingField ? 'ring-2 ring-[var(--accent-ring)] ring-offset-2' : ''}`

  const handleCardClick = (e) => {
    if (e.target.closest('button, input, select, textarea')) return
    onSelect?.(task.id)
  }

  return (
    <li
      className={`${compact ? baseClasses.replace('py-2.5', 'py-2') : baseClasses} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${isDone ? 'task-complete' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      data-task-id={task.id}
      draggable={draggable ?? false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect ? handleCardClick : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => e.key === 'Enter' && handleCardClick(e) : undefined}
    >
      <div className="mt-0.5 flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={`flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] border-2 transition-[var(--transition)] ${
            isDone ? 'border-[var(--muted)] bg-[var(--muted)] text-white' : 'border-[var(--border-strong)] text-transparent hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]'
          }`}
          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        {!isDone && (
          <button
            type="button"
            onClick={() => onUpdate(task.id, { doToday: !task.doToday })}
            className={`rounded p-1 transition-colors ${
              task.doToday ? 'text-[var(--danger)]' : 'text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)]'
            }`}
            title={task.doToday ? 'Must be done today (click to clear)' : 'Must be done today'}
            aria-label={task.doToday ? 'Clear do today' : 'Mark must be done today'}
          >
            <svg className="h-4 w-4" fill={task.doToday ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 3h-8v3h-2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="min-w-[120px] flex-1 overflow-hidden">
        {editingField === 'title' ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-[var(--color-border)] px-2 py-1 text-sm font-semibold outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20"
            aria-label="Edit task title"
          />
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => startEdit('title', task.title)}
              title="Cliquer pour modifier"
              className={`min-h-[1.25rem] min-w-0 flex-1 text-left transition-colors hover:text-[var(--color-accent)] ${
                compact ? 'overflow-hidden text-ellipsis whitespace-nowrap' : 'break-words whitespace-normal'
              } ${
                isDone ? 'text-[var(--color-text-ghost)] line-through' : 'text-[var(--color-text)]'
              } ${task.priority === 'high' ? 'text-[15px] font-bold' : 'text-[15px] font-semibold'} ${task.disliked ? 'italic opacity-80' : ''}`}
            >
              {task.title || 'Untitled'}
            </button>
            {!isDone && (
              <button
                type="button"
                onClick={() => startEdit('title', task.title)}
                className="shrink-0 rounded p-1 text-[var(--muted)] opacity-0 transition-opacity hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] group-hover:opacity-100"
                title="Modifier le titre"
                aria-label="Modifier le titre"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Meta line: all tags on one row (flag if High, date, countries, domains, project) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--color-text-ghost)]">
          {editingField === 'priority' ? (
            <select
              ref={inputRef}
              value={editValue}
              onChange={(e) => { onUpdate(task.id, { priority: e.target.value }); setEditingField(null) }}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="rounded border border-[var(--color-border)] bg-transparent px-1.5 py-0.5 text-[11px]"
              aria-label="Edit priority"
            >
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          ) : task.priority === 'high' ? (
            <button type="button" onClick={() => startEdit('priority', task.priority)} className="rounded p-0.5 text-[var(--priority-high)] hover:bg-[var(--priority-high-bg)]" title="High priority">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 3h-8v3h-2z" />
              </svg>
            </button>
          ) : null}
          {editingField === 'dueDate' ? (
            <input
              ref={inputRef}
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => { onUpdate(task.id, { dueDate: editValue || '' }); setEditingField(null) }}
              onKeyDown={handleKeyDown}
              className="w-24 rounded border border-[var(--color-border)] bg-transparent px-1.5 py-0.5 text-[11px]"
              aria-label="Edit due date"
            />
          ) : (
            <button type="button" onClick={() => startEdit('dueDate', task.dueDate || '')} className={`rounded px-1.5 py-0.5 ${isOverdue && !isDone ? 'text-[var(--color-overdue)]' : ''}`}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </button>
          )}
          {!compact && task.context === 'pro' && (task.countryIds ?? []).map((id) => {
            const c = COUNTRIES.find((x) => x.value === id)
            return c ? (
              <button key={id} type="button" onClick={() => toggleCountry(c.value)} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${c.tagClass ?? ''}`}>{c.label}</button>
            ) : null
          })}
          {!compact && task.context === 'pro' && (task.domainIds ?? []).map((id) => {
            const d = DOMAINS.find((x) => x.value === id)
            return d ? (
              <button key={id} type="button" onClick={() => startEdit('domain', task.domainIds ?? [])} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${d.tagClass ?? ''}`}>{d.label}</button>
            ) : null
          })}
          {!compact && projects.length > 0 && task.projectId && (
            <button type="button" onClick={() => startEdit('project', task.projectId || '')} className="truncate max-w-[120px] rounded px-1.5 py-0.5 text-left hover:bg-[var(--border)]/50 hover:text-[var(--color-text)]">
              {projects.find((pr) => pr.id === task.projectId)?.title ?? '…'}
            </button>
          )}
          {!compact && task.context === 'pro' && (task.countryIds ?? []).length === 0 && (
            <button type="button" onClick={() => startEdit('country', task.countryIds ?? [])} className="rounded px-1.5 py-0.5 text-[10px] text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--color-text)]">
              + pays
            </button>
          )}
          {!compact && task.context === 'pro' && (task.domainIds ?? []).length === 0 && (
            <button type="button" onClick={() => startEdit('domain', task.domainIds ?? [])} className="rounded px-1.5 py-0.5 text-[10px] text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--color-text)]">
              + domaine
            </button>
          )}
        </div>

        {editingField === 'project' && projects.length > 0 && (
          <div className="mt-1">
            <select
              ref={inputRef}
              value={editValue || ''}
              onChange={(e) => { onUpdate(task.id, { projectId: e.target.value || null }); setEditingField(null) }}
              onBlur={() => setEditingField(null)}
              onKeyDown={handleKeyDown}
              className="rounded border border-[var(--color-border)] bg-[var(--surface)] px-2 py-1 text-xs"
              aria-label="Project"
            >
              <option value="">No project</option>
              {flattenProjectsForSelect(projects).map((p) => (
                <option key={p.id} value={p.id}>{'—'.repeat(p.depth)}{p.depth ? ' ' : ''}{p.title}</option>
              ))}
            </select>
            <button type="button" onClick={() => setEditingField(null)} className="ml-1 text-[10px] text-[var(--muted)]">×</button>
          </div>
        )}
        {editingField === 'country' && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {COUNTRIES.map((c) => (
              <button key={c.value} type="button" onClick={() => toggleCountry(c.value)} className={`rounded px-2 py-0.5 text-[11px] font-medium ${c.tagClass ?? ''}`}>
                {c.label}
              </button>
            ))}
            <button type="button" onClick={() => setEditingField(null)} className="text-[10px] text-[var(--muted)]">×</button>
          </div>
        )}
        {editingField === 'domain' && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {DOMAINS.map((d) => {
              const selected = (task.domainIds ?? []).includes(d.value)
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDomain(d.value)}
                  className={`rounded px-2 py-0.5 text-[11px] ${selected ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'}`}
                >
                  {d.label}
                </button>
              )
            })}
            <button type="button" onClick={() => setEditingField(null)} className="text-[10px] text-[var(--muted)]">×</button>
          </div>
        )}

        {/* Note: only show when present or in edit */}
        {(task.note || editingField === 'note') && (
          <div className="mt-1">
            {editingField === 'note' ? (
              <textarea
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                maxLength={MAX_NOTE_LENGTH}
                rows={2}
                className="w-full rounded border border-[var(--color-border)] px-2 py-1 text-xs outline-none focus:border-[var(--color-accent)]"
                placeholder="Note..."
                aria-label="Edit note"
              />
            ) : (
              <button type="button" onClick={() => startEdit('note', task.note || '')} className="text-left text-[11px] text-[var(--color-text-ghost)] hover:text-[var(--color-text-muted)] line-clamp-2">
                {task.note}
              </button>
            )}
          </div>
        )}
        {!compact && !task.note && editingField !== 'note' && (
          <button type="button" onClick={() => startEdit('note', '')} className="mt-1 text-[10px] text-[var(--color-text-ghost)] opacity-70 hover:opacity-100">
            Add note
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-row flex-wrap items-center gap-1.5 self-start min-w-0">
        {!compact && (
          <>
            {isFocus ? (
              <button
                type="button"
                onClick={() => onRemoveFocus?.(task.id)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text)]"
                aria-label="Remove from Today"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddFocus?.(task.id)}
                className="rounded-lg p-2 text-[var(--color-text-ghost)] opacity-0 transition-all duration-200 hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] group-hover:opacity-100"
                aria-label="Add to Today"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-lg p-2 text-[var(--color-destructive-muted)] opacity-0 transition-all duration-200 hover:bg-[var(--color-overdue-bg)] hover:text-[var(--color-overdue)] group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-overdue)]/20"
          aria-label="Delete task"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

      </div>
    </li>
  )
}
