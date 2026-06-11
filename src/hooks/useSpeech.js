import { useState, useRef, useCallback, useEffect } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export const speechSupported = Boolean(SpeechRecognitionImpl);

export function useSpeech({ lang = "fr-FR", onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return;
    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (const result of event.results) {
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInterim(interimText);
      if (finalText) onResultRef.current?.(finalText.trim());
    };
    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
    };

    setError(null);
    setInterim("");
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported: speechSupported, listening, interim, error, start, stop };
}
