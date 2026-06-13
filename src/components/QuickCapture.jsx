import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { useSpeech } from "../hooks/useSpeech";
import { useSpeak } from "../hooks/useSpeak";
import { parseQuickInput } from "../utils/quickParse";
import { interpretCommand, resolveAmbiguous } from "../utils/voiceCommands";
import { formatCountdown, daysUntil } from "../utils/deadlines";

const TARGET_LABELS = { task: "Tâche", ticket: "Ticket", note: "Note" };
const TARGET_COLORS = { task: "tasks", ticket: "tickets", note: "notes" };

export function QuickCapture({
  isOpen,
  onClose,
  onSubmit,
  voiceContext = {},
  onVoiceCommand,
}) {
  const [text, setText] = useState("");
  const [journal, setJournal] = useState([]);
  const inputRef = useRef(null);
  const pendingRef = useRef(null);
  const voiceRef = useRef(voiceContext);
  const cmdRef = useRef(onVoiceCommand);

  useEffect(() => {
    voiceRef.current = voiceContext;
  });
  useEffect(() => {
    cmdRef.current = onVoiceCommand;
  });

  const { speak } = useSpeak();

  const handleTranscript = (transcript) => {
    if (!transcript) return;
    const intent = pendingRef.current
      ? resolveAmbiguous(transcript, pendingRef.current)
      : interpretCommand(transcript, voiceRef.current);
    pendingRef.current = null;
    const result = cmdRef.current?.(intent) ?? { message: "" };
    if (result.pending) pendingRef.current = result.pending;
    if (result.message) {
      speak(result.message);
      setJournal((j) => [...j, result.message].slice(-6));
    }
  };

  const { supported, listening, interim, error, start, stop } = useSpeech({
    continuous: true,
    onResult: handleTranscript,
  });

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    stop();
    pendingRef.current = null;
    setJournal([]);
  }, [isOpen, stop]);

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
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={listening && interim ? interim : text}
            onChange={(e) => setText(e.target.value)}
            readOnly={listening}
            placeholder={
              listening
                ? "À l'écoute… dites une commande"
                : "Ex. « payer le loyer demain », « va aux tickets »"
            }
            className="min-w-0 flex-1 rounded-[var(--radius-lg)] border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            aria-label="Capture rapide"
          />
          {supported && (
            <button
              type="button"
              onClick={listening ? stop : start}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all${listening ? " pulse-glow" : ""}`}
              style={{
                background: listening ? "var(--accent)" : "var(--surface-2)",
                color: listening ? "#fff" : "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
              aria-label={
                listening
                  ? "Terminer la session vocale"
                  : "Démarrer la session vocale"
              }
              title={listening ? "Terminer" : "Session vocale (fr)"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )}
        </div>

        {listening && (
          <p className="text-xs" style={{ color: "var(--accent)" }}>
            Session vocale active — « va aux tickets », « termine la 1 », «
            reporte X à demain », « qu'est-ce que j'ai aujourd'hui ». Cliquez le
            micro pour terminer.
          </p>
        )}

        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            Dictée indisponible ({error}). Vous pouvez taper votre texte.
          </p>
        )}

        {journal.length > 0 && (
          <ul
            className="flex flex-col gap-1 rounded-[var(--radius-lg)] p-2 text-xs"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            {journal.map((line, i) => (
              <li key={i} className="truncate">
                ↳ {line}
              </li>
            ))}
          </ul>
        )}

        {!listening && canSubmit && (
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
            disabled={!canSubmit || listening}
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
