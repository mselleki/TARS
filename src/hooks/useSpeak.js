import { useCallback } from "react";

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : undefined;
export const speakSupported = Boolean(synth);

export function useSpeak({ lang = "fr-FR" } = {}) {
  const speak = useCallback(
    (text, onDone) => {
      if (!synth || !text) {
        onDone?.();
        return;
      }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = lang;
      if (onDone) {
        utterance.onend = () => onDone();
        utterance.onerror = () => onDone();
      }
      synth.speak(utterance);
    },
    [lang],
  );
  const cancel = useCallback(() => synth?.cancel(), []);
  return { supported: speakSupported, speak, cancel };
}
