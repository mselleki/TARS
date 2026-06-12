import { useState } from "react";
import { createInitialRitual } from "../store/initialState";

export function RitualsView({ rituals, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-[var(--radius-lg)] bg-[var(--text)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--text-secondary)]"
        >
          Add ritual
        </button>
      </div>

      {rituals.length === 0 && !showNew && (
        <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted)]">No rituals yet</p>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="mt-4 text-sm font-medium text-[var(--muted)] underline decoration-[var(--border)] underline-offset-2 transition-[var(--transition)] hover:text-[var(--text)]"
          >
            Create your first ritual
          </button>
        </div>
      )}

      {showNew && (
        <RitualForm
          ritual={createInitialRitual()}
          onSave={(r) => {
            onAdd(r);
            setShowNew(false);
          }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {rituals.map((r) => (
        <div
          key={r.id}
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
        >
          {editingId === r.id ? (
            <RitualForm
              ritual={r}
              onSave={(updates) => {
                onUpdate(r.id, updates);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-[var(--text)]">
                  {r.name || "Untitled"}
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {r.schedule?.type === "daily" ? "Daily" : "Weekly"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(r.id)}
                  className="text-sm text-[var(--muted)] transition-[var(--transition)] hover:text-[var(--text)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="text-sm text-[var(--danger)] transition-[var(--transition)] hover:opacity-80"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RitualForm({ ritual, onSave, onCancel }) {
  const [name, setName] = useState(ritual.name ?? "");
  const [scheduleType, setScheduleType] = useState(
    ritual.schedule?.type ?? "daily",
  );
  const [questions, setQuestions] = useState(ritual.questions ?? ["", "", ""]);
  const [suggestedActions, setSuggestedActions] = useState(
    ritual.suggestedActions ?? ["", "", ""],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      schedule: { type: scheduleType },
      questions: questions.filter(Boolean),
      suggestedActions: suggestedActions.filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ritual name"
        className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
      />
      <select
        value={scheduleType}
        onChange={(e) => setScheduleType(e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          3 questions
        </label>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="text"
            value={questions[i] ?? ""}
            onChange={(e) => {
              const next = [...questions];
              next[i] = e.target.value;
              setQuestions(next);
            }}
            placeholder={`Question ${i + 1}`}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          Suggested actions
        </label>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="text"
            value={suggestedActions[i] ?? ""}
            onChange={(e) => {
              const next = [...suggestedActions];
              next[i] = e.target.value;
              setSuggestedActions(next);
            }}
            placeholder={`Action ${i + 1}`}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--muted)] transition-[var(--transition)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
