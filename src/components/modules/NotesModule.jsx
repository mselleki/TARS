import { NotesPanel } from "../NotesPanel";
import { ModuleHeader } from "./ModuleHeader";

export function NotesModule({
  meetingSheets = {},
  onMeetingSheetChange,
  standupLog = "",
}) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="notes" title="Notes" />
      <NotesPanel
        meetingSheets={meetingSheets}
        onMeetingSheetChange={onMeetingSheetChange}
        standupLog={standupLog}
        compact={false}
      />
    </div>
  );
}
