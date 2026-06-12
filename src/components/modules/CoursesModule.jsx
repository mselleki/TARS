import { CoursesPanel } from "../CoursesPanel";
import { ModuleHeader } from "./ModuleHeader";

export function CoursesModule({
  projects = [],
  tasks = [],
  onAddProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="courses" title="Cours" />
      <CoursesPanel
        projects={projects}
        tasks={tasks}
        context="perso"
        onAddProject={onAddProject}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onToggleTask={onToggleTask}
      />
    </div>
  );
}
