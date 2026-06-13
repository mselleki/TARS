import { useEffect } from "react";
import { useVoiceSession } from "../hooks/useVoiceSession";

export function VoiceDock({ onClose, voiceContext, onVoiceCommand }) {
  const { active, listening, interim, journal, error, start, stop } =
    useVoiceSession({
      voiceContext,
      onVoiceCommand,
    });

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const lastTwo = journal.slice(-2);

  return (
    <div
      className="dock-slide-up fixed inset-x-0 z-30 px-3 pb-2"
      style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      role="status"
      aria-live="polite"
    >
      <div
        className="mx-auto flex max-w-2xl flex-col gap-1.5 rounded-[var(--radius-xl)] px-4 py-3"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm${listening ? " pulse-glow" : ""}`}
            style={{
              background: listening ? "var(--accent)" : "var(--surface-2)",
              color: listening ? "#fff" : "var(--text-secondary)",
            }}
            aria-hidden
          >
            {listening ? "🎙" : "🔊"}
          </span>
          <span
            className="min-w-0 flex-1 truncate text-sm"
            style={{ color: "var(--text)" }}
          >
            {interim
              ? interim
              : listening
                ? "À l'écoute… dites une commande"
                : active
                  ? "Réponse en cours…"
                  : "Session vocale"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
            aria-label="Terminer la session vocale"
            title="Terminer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            Dictée indisponible ({error}). Fermez et réessayez, ou tapez via «
            Capturer ».
          </p>
        )}

        {lastTwo.length > 0 && (
          <ul
            className="flex flex-col gap-0.5 text-xs"
            style={{ color: "var(--muted)" }}
          >
            {lastTwo.map((line, i) => (
              <li key={i} className="truncate">
                ↳ {line}
              </li>
            ))}
          </ul>
        )}

        {!error && journal.length === 0 && (
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            « va aux tickets » · « termine la 1 » · « reporte X à demain » · «
            qu'est-ce que j'ai aujourd'hui »
          </p>
        )}
      </div>
    </div>
  );
}
