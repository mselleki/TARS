import { useState, useRef, useCallback, useEffect } from "react";
import { useStore } from "./hooks/useStore";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { usePWA } from "./hooks/usePWA";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { TaskComposer } from "./components/TaskComposer";
import { KanbanBoard } from "./components/KanbanBoard";
import { ProjectsView } from "./components/ProjectsView";
import { EmptyState, SearchEmptyState } from "./components/EmptyState";
import { InstallPrompt } from "./components/InstallPrompt";
import { Modal } from "./components/Modal";
import { Toast } from "./components/Toast";
import { TaskPanel } from "./components/TaskPanel";
import { CockpitView } from "./components/CockpitView";
import { QuickCapture } from "./components/QuickCapture";
import { TicketsModule } from "./components/modules/TicketsModule";
import { NotesModule } from "./components/modules/NotesModule";
import { AgendaModule } from "./components/modules/AgendaModule";
import { CoursesModule } from "./components/modules/CoursesModule";
import { RitualsModule } from "./components/modules/RitualsModule";
import { today } from "./utils/date";
import { COUNTRIES, DOMAINS } from "./constants";
import "./App.css";

function App() {
  const [context, setContext] = useState("pro");
  const [view, setView] = useState("cockpit");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketFilters, setTicketFilters] = useState({
    business: null,
    domain: null,
    owner: null,
    countryId: null,
  });
  const [boardViewMode, setBoardViewMode] = useState("cards");
  const [boardFilters, setBoardFilters] = useState({
    projectId: "",
    countryId: "",
    domain: "",
  });
  const [showComposer, setShowComposer] = useState(false);
  const [composerProjectId, setComposerProjectId] = useState(null);
  const [composerInitialDueDate, setComposerInitialDueDate] = useState("");
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("organizer-theme") !== "light";
    } catch {
      return true;
    }
  });
  const searchRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("organizer-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("organizer-theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (view !== "tasks" && view !== "cockpit") setSelectedTaskId(null);
  }, [view]);

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
    todayPlan,
    addReqTicket,
    updateReqTicket,
    deleteReqTicket,
    setStandupLog,
    setMeetingSheet,
    addRitual,
    updateRitual,
    deleteRitual,
  } = useStore();

  const { filtered, kanbanColumns } = useTaskFilters({
    tasks: state.tasks,
    context,
    searchQuery,
    todayFocusIds: [],
    boardFilters: view === "tasks" && context === "pro" ? boardFilters : null,
    projects: state.projects,
  });

  const { canInstall, showInstallBanner, install, dismissInstall } = usePWA();

  const handleNewTask = useCallback((projectId = null) => {
    const id = typeof projectId === "string" ? projectId : null;
    setComposerProjectId(id);
    setShowComposer(true);
  }, []);
  const handleFocusSearch = useCallback(() => searchRef.current?.focus(), []);
  const handleGoOverview = useCallback(() => setView("cockpit"), []);
  const handleEscape = useCallback(() => {
    setShowComposer(false);
    setComposerProjectId(null);
    setComposerInitialDueDate("");
  }, []);

  const handleOpenComposerForDate = useCallback((dateStr) => {
    setComposerProjectId(null);
    setComposerInitialDueDate(dateStr || "");
    setShowComposer(true);
  }, []);

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onFocusSearch: handleFocusSearch,
    onGoOverview: handleGoOverview,
    onEscape: handleEscape,
    onQuickCapture: () => setShowQuickCapture(true),
    enabled: !showComposer,
  });

  const handleAddTask = useCallback(
    (payload) => {
      addTask({ ...payload, context, projectId: payload.projectId || null });
      setShowComposer(false);
      setComposerProjectId(null);
      setToastMessage("Task created");
    },
    [addTask, context],
  );

  const handleQuickCapture = useCallback(
    (parsed) => {
      if (parsed.target === "ticket") {
        addReqTicket({ summary: parsed.title, dueAt: parsed.dueDate || null });
        setToastMessage("Ticket créé");
      } else if (parsed.target === "note") {
        setStandupLog(
          `${state.standupLog ? state.standupLog + "\n" : ""}• ${parsed.title}`,
        );
        setToastMessage("Note ajoutée");
      } else {
        addTask({
          title: parsed.title,
          context,
          dueDate: parsed.dueDate || "",
          dueTime: parsed.dueTime || "",
          doToday: parsed.dueDate === today(),
          projectId: null,
        });
        setToastMessage("Tâche créée");
      }
      setShowQuickCapture(false);
    },
    [addReqTicket, setStandupLog, addTask, context, state.standupLog],
  );

  const handleStatusChange = (id, status) => {
    updateTask(id, { status });
  };

  const handleAddProject = useCallback(() => {
    addProject({ title: "New project", context });
  }, [addProject, context]);

  const handleAddSubProject = useCallback(
    (parentId) => {
      addProject({
        title: "New sub-project",
        context,
        parentProjectId: parentId,
      });
    },
    [addProject, context],
  );

  const handleDeleteProject = useCallback(
    (id) => {
      const subs = state.projects.filter((p) => p.parentProjectId === id);
      subs.forEach((s) => handleDeleteProject(s.id));
      state.tasks
        .filter((t) => t.projectId === id)
        .forEach((t) => updateTask(t.id, { projectId: null }));
      deleteProject(id);
    },
    [state.projects, state.tasks, deleteProject, updateTask],
  );

  const handleOpenComposerForProject = useCallback((projectId) => {
    setComposerProjectId(projectId);
    setShowComposer(true);
  }, []);

  return (
    <div className="flex min-h-screen text-[var(--text)]">
      <Sidebar
        view={view}
        onViewChange={setView}
        context={context}
        onContextChange={setContext}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResultsCount={
            view === "tickets"
              ? (state.reqTickets ?? []).length
              : filtered.length
          }
          searchRef={searchRef}
          onInstallClick={install}
          canInstall={canInstall}
          onOpenQuickCapture={() => setShowQuickCapture(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((v) => !v)}
          syncStatus={syncStatus}
        />

        <main
          className={`flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6 lg:mx-auto ${["tasks", "tickets"].includes(view) ? "lg:max-w-7xl" : view === "cockpit" ? "lg:max-w-6xl" : "lg:max-w-4xl"}`}
        >
          <div key={view} className="view-transition">
            {view === "cockpit" && (
              <CockpitView
                context={context}
                tasks={state.tasks}
                reqTickets={state.reqTickets ?? []}
                rituals={state.rituals ?? []}
                projects={state.projects}
                todayPlan={todayPlan}
                onToggleTask={toggleTaskStatus}
                onNavigate={setView}
              />
            )}

            {view === "tasks" && (
              <>
                {/* Board toolbar: new task + filters + view mode */}
                <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleNewTask()}
                    className="btn-primary flex min-h-[36px] touch-manipulation items-center gap-2 px-4 py-2 text-sm sm:min-h-0"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    New task
                  </button>

                  {/* Filters — pill selects, only for pro */}
                  {context === "pro" && (
                    <>
                      <div
                        className="h-4 w-px shrink-0"
                        style={{ background: "var(--border)" }}
                        aria-hidden
                      />
                      <select
                        value={boardFilters.projectId}
                        onChange={(e) =>
                          setBoardFilters((f) => ({
                            ...f,
                            projectId: e.target.value,
                          }))
                        }
                        className={`input-glass rounded-[var(--radius-full)] px-3 py-1.5 text-[12px] transition-colors ${boardFilters.projectId ? "text-[var(--accent)] border-[var(--accent-ring)]" : ""}`}
                        aria-label="Sub-project"
                      >
                        <option value="">Project</option>
                        {state.projects
                          .filter((p) => p.context === context)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                      </select>
                      <select
                        value={boardFilters.countryId}
                        onChange={(e) =>
                          setBoardFilters((f) => ({
                            ...f,
                            countryId: e.target.value,
                          }))
                        }
                        className={`input-glass rounded-[var(--radius-full)] px-3 py-1.5 text-[12px] transition-colors ${boardFilters.countryId ? "text-[var(--accent)] border-[var(--accent-ring)]" : ""}`}
                        aria-label="Country"
                      >
                        <option value="">Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={boardFilters.domain}
                        onChange={(e) =>
                          setBoardFilters((f) => ({
                            ...f,
                            domain: e.target.value,
                          }))
                        }
                        className={`input-glass rounded-[var(--radius-full)] px-3 py-1.5 text-[12px] transition-colors ${boardFilters.domain ? "text-[var(--accent)] border-[var(--accent-ring)]" : ""}`}
                        aria-label="Domain"
                      >
                        <option value="">Domain</option>
                        {DOMAINS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      {(boardFilters.projectId ||
                        boardFilters.countryId ||
                        boardFilters.domain) && (
                        <button
                          type="button"
                          onClick={() =>
                            setBoardFilters({
                              projectId: "",
                              countryId: "",
                              domain: "",
                            })
                          }
                          className="text-[11px] font-medium transition-colors"
                          style={{ color: "var(--muted)" }}
                        >
                          ✕ Reset
                        </button>
                      )}
                    </>
                  )}

                  {/* View mode toggle — pushed right */}
                  <div
                    role="group"
                    aria-label="View mode"
                    className="ml-auto flex rounded-[var(--radius-md)] p-0.5"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {["list", "cards"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBoardViewMode(mode)}
                        className="rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px] font-medium capitalize transition-all"
                        style={{
                          background:
                            boardViewMode === mode
                              ? "var(--surface-elevated)"
                              : "transparent",
                          color:
                            boardViewMode === mode
                              ? "var(--text)"
                              : "var(--muted)",
                          boxShadow:
                            boardViewMode === mode
                              ? "var(--shadow-sm)"
                              : "none",
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                {filtered.length === 0 ? (
                  searchQuery ? (
                    <SearchEmptyState onClear={() => setSearchQuery("")} />
                  ) : (
                    <EmptyState
                      onAction={() => handleNewTask()}
                      shortcut="Ctrl+K"
                    />
                  )
                ) : (
                  <KanbanBoard
                    columns={kanbanColumns}
                    projects={state.projects.filter(
                      (p) => p.context === context,
                    )}
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

            {view === "projects" && (
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

            {view === "tickets" && (
              <TicketsModule
                reqTickets={state.reqTickets ?? []}
                filters={ticketFilters}
                onFiltersChange={setTicketFilters}
                onAddReqTicket={addReqTicket}
                onUpdateReqTicket={updateReqTicket}
                onDeleteReqTicket={deleteReqTicket}
              />
            )}

            {view === "rituals" && (
              <RitualsModule
                rituals={state.rituals ?? []}
                onAddRitual={addRitual}
                onUpdateRitual={updateRitual}
                onDeleteRitual={deleteRitual}
              />
            )}

            {view === "notes" && (
              <NotesModule
                meetingSheets={state.meetingSheets ?? {}}
                onMeetingSheetChange={setMeetingSheet}
                standupLog={state.standupLog ?? ""}
              />
            )}

            {view === "agenda" && (
              <AgendaModule
                tasks={state.tasks.filter((t) => t.context === "perso")}
                onToggleTask={toggleTaskStatus}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddTaskForDate={handleOpenComposerForDate}
              />
            )}

            {view === "courses" && (
              <CoursesModule
                projects={state.projects}
                tasks={state.tasks}
                onAddProject={addProject}
                onAddTask={(p) => addTask({ ...p, context: "perso" })}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onToggleTask={toggleTaskStatus}
              />
            )}
          </div>
          {/* end view-transition */}
        </main>
      </div>

      <Modal isOpen={showComposer} onClose={handleEscape} title="New task">
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

      {(view === "tasks" || view === "cockpit") &&
        selectedTaskId &&
        (() => {
          const task = state.tasks.find((t) => t.id === selectedTaskId);
          return task ? (
            <TaskPanel
              task={task}
              onClose={() => setSelectedTaskId(null)}
              onUpdate={updateTask}
            />
          ) : null;
        })()}

      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onSubmit={handleQuickCapture}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />

      <InstallPrompt
        show={showInstallBanner}
        onInstall={install}
        onDismiss={dismissInstall}
      />

      <BottomNav
        view={view}
        onViewChange={setView}
        onOpenQuickCapture={() => setShowQuickCapture(true)}
      />
    </div>
  );
}

export default App;
