import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { parseQuickInput } from "../utils/quickParse";
import { formatCountdown, daysUntil } from "../utils/deadlines";

const TARGET_LABELS = { task: "Tâche", ticket: "Ticket", note: "Note" };
const TARGET_COLORS = { task: "tasks", ticket: "tickets", note: "notes" };

export function QuickCapture({ isOpen, onClose, onSubmit }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setText("");
  }, [isOpen]);

  const handleClose = () => {
    setText("");
    onClose?.();
  };

  const parsed = parseQuickInput(text);
  const canSubmit = parsed.title.length > 0;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onSubmit?.(parsed);
    setText("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Capture rapide">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            "Ex. « payer le loyer demain », « ticket : relancer X vendredi »"
          }
          className="w-full rounded-[var(--radius-lg)] border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
          aria-label="Capture rapide"
        />

        {canSubmit && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{
                background: `var(--mod-${TARGET_COLORS[parsed.target]}-bg)`,
                color: `var(--mod-${TARGET_COLORS[parsed.target]})`,
              }}
            >
              {TARGET_LABELS[parsed.target]}
            </span>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {parsed.title}
            </span>
            {parsed.dueDate && parsed.target !== "note" && (
              <span
                className="rounded-full px-2.5 py-1"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-secondary)",
                }}
              >
                📅 {formatCountdown(daysUntil(parsed.dueDate))}
              </span>
            )}
            {parsed.dueTime && parsed.target !== "note" && (
              <span
                className="rounded-full px-2.5 py-1"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-secondary)",
                }}
              >
                🕐 {parsed.dueTime}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Fermer
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-[var(--radius-lg)] px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}
