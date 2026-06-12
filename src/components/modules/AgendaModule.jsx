import { PersoAgenda } from "../PersoAgenda";
import { ModuleHeader } from "./ModuleHeader";

export function AgendaModule({
  tasks = [],
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTaskForDate,
}) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="agenda" title="Agenda" />
      <PersoAgenda
        tasks={tasks}
        onToggleTask={onToggleTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onAddTaskForDate={onAddTaskForDate}
      />
    </div>
  );
}
