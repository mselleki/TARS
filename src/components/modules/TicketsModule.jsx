import { useMemo } from "react";
import { CockpitFocusColumn } from "../CockpitFocusColumn";
import { TicketCaptureForm } from "../TicketCaptureForm";
import { ModuleHeader } from "./ModuleHeader";

export function TicketsModule({
  reqTickets = [],
  filters = {},
  onFiltersChange,
  onAddReqTicket,
  onUpdateReqTicket,
  onDeleteReqTicket,
}) {
  const proTickets = useMemo(
    () => reqTickets.filter((t) => t.scope === "PRO"),
    [reqTickets],
  );
  const existingOwners = useMemo(
    () => reqTickets.map((t) => t.owner).filter(Boolean),
    [reqTickets],
  );
  const openCount = proTickets.filter((t) => t.status !== "DONE").length;

  return (
    <div className="space-y-4">
      <ModuleHeader
        color="tickets"
        title="Tickets"
        subtitle={`${openCount} ouvert${openCount > 1 ? "s" : ""}`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CockpitFocusColumn
          tickets={proTickets}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onMarkDone={(id) => onUpdateReqTicket?.(id, { status: "DONE" })}
          onSetWaiting={(id) =>
            onUpdateReqTicket?.(id, { status: "WAITING_REPLY" })
          }
          onAddFollowUp={(id) =>
            onUpdateReqTicket?.(id, { lastFollowUpAt: Date.now() })
          }
          onSetDueDate={(id, dueAt) => onUpdateReqTicket?.(id, { dueAt })}
          onDelete={onDeleteReqTicket}
        />
        <section
          className="h-fit overflow-hidden rounded-[var(--radius-xl)]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
          aria-label="Nouveau ticket"
        >
          <div className="px-4 pt-3 pb-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.09em]"
              style={{ color: "var(--muted)" }}
            >
              Nouveau ticket
            </p>
          </div>
          <div className="px-4 pb-4">
            <TicketCaptureForm
              onSubmit={(payload) => onAddReqTicket?.(payload)}
              scope="PRO"
              existingOwners={existingOwners}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
