import { useState, useRef, useCallback, useEffect } from 'react'
import { useStore } from './hooks/useStore'
import { useTaskFilters } from './hooks/useTaskFilters'
import { usePWA } from './hooks/usePWA'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { BottomNav } from './components/BottomNav'
import { OverviewView } from './components/OverviewView'
import { TaskComposer } from './components/TaskComposer'
import { KanbanBoard } from './components/KanbanBoard'
import { ProjectsView } from './components/ProjectsView'
import { EmptyState, SearchEmptyState } from './components/EmptyState'
import { InstallPrompt } from './components/InstallPrompt'
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { TaskItem } from './components/TaskItem'
import { TaskPanel } from './components/TaskPanel'
import { TodayView } from './components/TodayView'
import { COUNTRIES, DOMAINS } from './constants'
import './App.css'

function App() {
  const [context, setContext] = useState('pro')
  const [view, setView] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [ticketFilters, setTicketFilters] = useState({ business: null, domain: null, owner: null, countryId: null })
  const [boardViewMode, setBoardViewMode] = useState('cards')
  const [boardFilters, setBoardFilters] = useState({ projectId: '', countryId: '', domain: '' })
  const [showComposer, setShowComposer] = useState(false)
  const [composerProjectId, setComposerProjectId] = useState(null)
  const [composerInitialDueDate, setComposerInitialDueDate] = useState('')
  const [isSilentMode, setIsSilentMode] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('organizer-theme') === 'dark'
    } catch {
      return false
    }
  })
  const searchRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('organizer-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('organizer-theme', 'light')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (view !== 'board' && view !== 'today') setSelectedTaskId(null)
  }, [view])

  const {
    state,
    syncStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addProject,
    updateProject,
    deleteProject,
    addFocus,
    removeFocus,
    reorderFocus,
    todayPlan,
    addTicket,
    updateTicket,
    deleteTicket,
    resolveTicket,
    addReqTicket,
    updateReqTicket,
    deleteReqTicket,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addRequester,
    updateReflection,
  } = useStore()

  const { filtered, backlog, inProgress, done, kanbanColumns } =
    useTaskFilters({
      tasks: state.tasks,
      context,
      searchQuery,
      todayFocusIds: [],
      boardFilters: view === 'board' && context === 'pro' ? boardFilters : null,
      projects: state.projects,
    })

  const { canInstall, showInstallBanner, install, dismissInstall } = usePWA()

  const handleNewTask = useCallback((projectId = null) => {
    const id = typeof projectId === 'string' ? projectId : null
    setComposerProjectId(id)
    setShowComposer(true)
  }, [])
  const handleFocusSearch = useCallback(() => searchRef.current?.focus(), [])
  const handleGoOverview = useCallback(() => setView('overview'), [])
  const handleEscape = useCallback(() => {
    setShowComposer(false)
    setComposerProjectId(null)
    setComposerInitialDueDate('')
    setIsSilentMode(false)
  }, [])

  const handleOpenComposerForDate = useCallback((dateStr) => {
    setComposerProjectId(null)
    setComposerInitialDueDate(dateStr || '')
    setShowComposer(true)
  }, [])

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onFocusSearch: handleFocusSearch,
    onGoOverview: handleGoOverview,
    onEscape: handleEscape,
    enabled: !showComposer,
  })

  const handleAddTask = useCallback((payload) => {
    addTask({ ...payload, context, projectId: payload.projectId || null })
    setShowComposer(false)
    setComposerProjectId(null)
    setToastMessage('Task created')
  }, [addTask, context])

  const handleStatusChange = (id, status) => {
    updateTask(id, { status })
  }

  const handleAddProject = useCallback(() => {
    addProject({ title: 'New project', context })
  }, [addProject])

  const handleAddSubProject = useCallback((parentId) => {
    addProject({ title: 'New sub-project', context, parentProjectId: parentId })
  }, [addProject, context])

  const handleAddCategory = useCallback((parentId, title) => {
    addProject({ title: title || 'Nouvelle catégorie', context, parentProjectId: parentId })
  }, [addProject, context])

  const handleDeleteProject = useCallback((id) => {
    const subs = state.projects.filter((p) => p.parentProjectId === id)
    subs.forEach((s) => handleDeleteProject(s.id))
    state.tasks.filter((t) => t.projectId === id).forEach((t) => updateTask(t.id, { projectId: null }))
    deleteProject(id)
  }, [state.projects, state.tasks, deleteProject, updateTask])

  const handleOpenComposerForProject = useCallback((projectId) => {
    setComposerProjectId(projectId)
    setShowComposer(true)
  }, [])

  const contextTasks = state.tasks.filter((t) => t.context === context)
  const isEmpty = contextTasks.length === 0

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar view={view} onViewChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
      <Header
        context={context}
        onContextChange={setContext}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResultsCount={view === 'overview' ? (state.reqTickets ?? []).length : filtered.length}
        searchRef={searchRef}
        view={view}
        ticketFilters={ticketFilters}
        onTicketFiltersChange={setTicketFilters}
        onInstallClick={install}
        canInstall={canInstall}
        isSilentMode={isSilentMode}
        onToggleSilentMode={() => setIsSilentMode((v) => !v)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((v) => !v)}
        syncStatus={syncStatus}
      />

      <main className={`flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6 lg:mx-auto ${view === 'board' ? 'lg:max-w-7xl' : 'lg:max-w-4xl'}`}>
        {view === 'overview' && (
          <OverviewView
            context={context}
            reqTickets={state.reqTickets ?? []}
            searchQuery={searchQuery}
            filters={ticketFilters}
            onAddReqTicket={addReqTicket}
            onUpdateReqTicket={updateReqTicket}
            onDeleteReqTicket={deleteReqTicket}
            projects={state.projects}
            tasks={state.tasks}
            onAddProject={addProject}
            onAddTask={(p) => addTask({ ...p, context: 'perso' })}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTaskStatus}
            onOpenComposerForDate={handleOpenComposerForDate}
            standupLog={state.standupLog ?? ''}
            onStandupLogChange={setStandupLog}
            meetingSheets={state.meetingSheets ?? {}}
            onMeetingSheetChange={setMeetingSheet}
          />
        )}

        {view === 'board' && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6 sm:gap-4">
              <button
                type="button"
                onClick={() => handleNewTask()}
                className="flex min-h-[48px] touch-manipulation items-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[var(--transition)] active:border-[var(--accent)]/40 active:bg-[var(--accent-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] sm:min-h-0 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg)] text-[var(--muted)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add a task
              </button>
              <div role="group" aria-label="View mode" className="flex rounded-[var(--radius-md)] bg-[var(--bg)] p-0.5">
                <button
                  type="button"
                  onClick={() => setBoardViewMode('list')}
                  className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px] font-medium transition-[var(--transition)] ${
                    boardViewMode === 'list' ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)] border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setBoardViewMode('cards')}
                  className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px] font-medium transition-[var(--transition)] ${
                    boardViewMode === 'cards' ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)] border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>

            {context === 'pro' && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 sm:gap-3 sm:px-4">
                <span className="text-xs font-medium text-[var(--muted)]">Filtres :</span>
                <select
                  value={boardFilters.projectId}
                  onChange={(e) => setBoardFilters((f) => ({ ...f, projectId: e.target.value }))}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text)]"
                  aria-label="Sous-projet"
                >
                  <option value="">Tous les sous-projets</option>
                  {state.projects.filter((p) => p.context === context).map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <select
                  value={boardFilters.countryId}
                  onChange={(e) => setBoardFilters((f) => ({ ...f, countryId: e.target.value }))}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text)]"
                  aria-label="Pays"
                >
                  <option value="">Tous les pays</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={boardFilters.domain}
                  onChange={(e) => setBoardFilters((f) => ({ ...f, domain: e.target.value }))}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text)]"
                  aria-label="Domaine"
                >
                  <option value="">Tous les domaines</option>
                  {DOMAINS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                {(boardFilters.projectId || boardFilters.countryId || boardFilters.domain) && (
                  <button
                    type="button"
                    onClick={() => setBoardFilters({ projectId: '', countryId: '', domain: '' })}
                    className="text-xs font-medium text-[var(--muted)] underline hover:text-[var(--text)]"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            )}
            {filtered.length === 0 ? (
              searchQuery ? (
                <SearchEmptyState onClear={() => setSearchQuery('')} />
              ) : (
                <EmptyState onAction={() => handleNewTask()} shortcut="Ctrl+K" />
              )
            ) : (
              <KanbanBoard
                columns={kanbanColumns}
                projects={state.projects.filter((p) => p.context === context)}
                onToggle={toggleTaskStatus}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onStatusChange={handleStatusChange}
                onTaskSelect={setSelectedTaskId}
                viewMode={boardViewMode}
                searchQuery={searchQuery}
              />
            )}
          </>
        )}

        {view === 'today' && (
          <TodayView
            context={context}
            tasks={state.tasks.filter((t) => t.context === context)}
            todayPlan={todayPlan}
            projects={state.projects.filter((p) => p.context === context)}
            onToggle={toggleTaskStatus}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onStatusChange={handleStatusChange}
            onAddFocus={addFocus}
            onRemoveFocus={removeFocus}
            onReorderFocus={reorderFocus}
            onChoosePriorities={() => setView('board')}
            isSilentMode={isSilentMode}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            searchQuery={searchQuery}
          />
        )}

        {view === 'projects' && (
          <ProjectsView
            projects={state.projects}
            tasks={filtered}
            context={context}
            onAddProject={handleAddProject}
            onAddSubProject={handleAddSubProject}
            onUpdateProject={updateProject}
            onDeleteProject={handleDeleteProject}
            onAddTask={handleOpenComposerForProject}
            onToggle={toggleTaskStatus}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onStatusChange={handleStatusChange}
            onAddFocus={() => {}}
            onRemoveFocus={() => {}}
            focusIds={[]}
          />
        )}

      </main>
      </div>

      <Modal
        isOpen={showComposer}
        onClose={handleEscape}
        title="New task"
      >
        <TaskComposer
          onSubmit={handleAddTask}
          onCancel={handleEscape}
          context={context}
          initialFocus
          embedded
          projectId={composerProjectId}
          projects={state.projects.filter((p) => p.context === context)}
          onProjectChange={setComposerProjectId}
          initialDueDate={composerInitialDueDate}
        />
      </Modal>

      {(view === 'board' || view === 'today') && selectedTaskId && (() => {
        const task = state.tasks.find((t) => t.id === selectedTaskId)
        return task ? (
          <TaskPanel
            task={task}
            onClose={() => setSelectedTaskId(null)}
            onUpdate={updateTask}
          />
        ) : null
      })()}

      <Toast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      <InstallPrompt
        show={showInstallBanner}
        onInstall={install}
        onDismiss={dismissInstall}
      />

      <BottomNav view={view} onViewChange={setView} />
    </div>
  )
}

export default App
