import { RitualsView } from "../RitualsView";
import { ModuleHeader } from "./ModuleHeader";

export function RitualsModule({
  rituals = [],
  onAddRitual,
  onUpdateRitual,
  onDeleteRitual,
}) {
  return (
    <div className="space-y-4">
      <ModuleHeader
        color="rituals"
        title="Rituels"
        subtitle={`${rituals.length} rituel${rituals.length > 1 ? "s" : ""}`}
      />
      <RitualsView
        rituals={rituals}
        onAdd={onAddRitual}
        onUpdate={onUpdateRitual}
        onDelete={onDeleteRitual}
      />
    </div>
  );
}
