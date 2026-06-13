import { useCallback } from "react";

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : undefined;
export const speakSupported = Boolean(synth);

export function useSpeak({ lang = "fr-FR" } = {}) {
  const speak = useCallback(
    (text) => {
      if (!synth || !text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = lang;
      synth.speak(utterance);
    },
    [lang],
  );
  const cancel = useCallback(() => synth?.cancel(), []);
  return { supported: speakSupported, speak, cancel };
}
