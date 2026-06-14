import { useCallback, useRef, useEffect } from "react";

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : undefined;
export const speakSupported = Boolean(synth);

// Names of higher-quality French voices to prefer over the default one.
const PREFERRED = [
  "google français",
  "microsoft denise",
  "microsoft henri",
  "amélie",
  "thomas",
  "audrey",
  "aurelie",
];

function pickVoice(voices) {
  const fr = (voices ?? []).filter((v) => /^fr/i.test(v.lang));
  if (!fr.length) return null;
  const liked = fr.find((v) =>
    PREFERRED.some((p) => v.name.toLowerCase().includes(p)),
  );
  return liked || fr.find((v) => v.lang === "fr-FR") || fr[0];
}

export function useSpeak({ lang = "fr-FR", rate = 1.05 } = {}) {
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!synth) return undefined;
    const update = () => {
      voiceRef.current = pickVoice(synth.getVoices());
    };
    update();
    synth.addEventListener?.("voiceschanged", update);
    return () => synth.removeEventListener?.("voiceschanged", update);
  }, []);

  const speak = useCallback(
    (text, onDone) => {
      if (!synth || !text) {
        onDone?.();
        return;
      }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = lang;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = rate;
      if (onDone) {
        utterance.onend = () => onDone();
        utterance.onerror = () => onDone();
      }
      synth.speak(utterance);
    },
    [lang, rate],
  );

  const cancel = useCallback(() => synth?.cancel(), []);
  return { supported: speakSupported, speak, cancel };
}
