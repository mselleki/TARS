import { useEffect, useCallback } from "react";

function isInputFocused() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    active.isContentEditable
  );
}

export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onGoOverview,
  onEscape,
  onQuickCapture,
  enabled = true,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return;

      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      const inInput = isInputFocused();
      if (inInput && e.key !== "Escape") {
        if (e.key === "k" || e.key === "K") {
          if (!e.ctrlKey && !e.metaKey) return;
        } else if (e.key === "/" || e.key === "o" || e.key === "O") {
          return;
        }
      }

      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onNewTask?.();
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (e.key === "o" || e.key === "O") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onGoOverview?.();
          return;
        }
      }

      if (
        (e.key === "n" || e.key === "N") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !inInput
      ) {
        e.preventDefault();
        onQuickCapture?.();
        return;
      }
    },
    [enabled, onNewTask, onFocusSearch, onGoOverview, onEscape, onQuickCapture],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleKeyDown]);
}
