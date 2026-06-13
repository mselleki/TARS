import { useState, useRef, useCallback, useEffect } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export const speechSupported = Boolean(SpeechRecognitionImpl);

// Half-duplex by design: each start() listens for a single utterance and ends.
// The caller decides when to re-arm (via onEnd), so the microphone can be kept
// closed while the app speaks — preventing the TTS output from being recognized
// as new input (acoustic feedback loop).
export function useSpeech({ lang = "fr-FR", onResult, onEnd, onError } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
  });
  useEffect(() => {
    onEndRef.current = onEnd;
  });
  useEffect(() => {
    onErrorRef.current = onError;
  });

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
    // onerror only reports; onend (which always follows) does the cleanup and
    // notification, so each recognition is finalized exactly once.
    recognition.onerror = (event) => {
      onErrorRef.current?.(event.error);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
      onEndRef.current?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return { supported: speechSupported, listening, interim, start, stop };
}
