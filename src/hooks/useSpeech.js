import { useState, useRef, useCallback, useEffect } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export const speechSupported = Boolean(SpeechRecognitionImpl);

export function useSpeech({
  lang = "fr-FR",
  onResult,
  continuous = false,
} = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const wantRef = useRef(false);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  const launchRef = useRef(null);

  const launch = useCallback(() => {
    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = continuous;

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
      wantRef.current = false;
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setInterim("");
      if (continuous && wantRef.current && launchRef.current) {
        launchRef.current();
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang, continuous]);

  useEffect(() => {
    launchRef.current = launch;
  }, [launch]);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return;
    setError(null);
    setInterim("");
    wantRef.current = true;
    launch();
  }, [launch]);

  const stop = useCallback(() => {
    wantRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported: speechSupported, listening, interim, error, start, stop };
}
