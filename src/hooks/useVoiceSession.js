import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeech } from "./useSpeech";
import { useSpeak } from "./useSpeak";

const TRANSIENT_ERRORS = new Set(["no-speech", "aborted"]);

// Half-duplex voice session: listens one utterance, calls the assistant,
// speaks the reply with the mic closed, then re-arms. Never keep the mic open
// during the network call or TTS (acoustic feedback loop). `busyRef` is a
// synchronous guard — `onresult`/`onend` fire back-to-back before React
// re-renders, so a state flag would race; the ref does not.
export function useVoiceSession({ onTranscript }) {
  const [journal, setJournal] = useState([]);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const [thinking, setThinking] = useState(false);
  const sessionRef = useRef(false);
  const busyRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const speechRef = useRef(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const { speak, cancel } = useSpeak();

  const reArm = useCallback(() => {
    if (sessionRef.current && !busyRef.current) speechRef.current?.start();
  }, []);

  const onResult = useCallback(
    async (transcript) => {
      if (!transcript) return;
      busyRef.current = true;
      setThinking(true);
      let result;
      try {
        result = await onTranscriptRef.current?.(transcript);
      } catch {
        result = { speech: "Assistant indisponible." };
      }
      setThinking(false);
      if (!sessionRef.current) {
        busyRef.current = false;
        return;
      }
      const speech = result?.speech;
      if (speech) {
        setJournal((j) => [...j, speech].slice(-6));
        speak(speech, () => {
          busyRef.current = false;
          reArm();
        });
      } else {
        busyRef.current = false;
        reArm();
      }
    },
    [speak, reArm],
  );

  const onEnd = useCallback(() => {
    reArm();
  }, [reArm]);

  const onError = useCallback((err) => {
    if (TRANSIENT_ERRORS.has(err)) return;
    sessionRef.current = false;
    busyRef.current = false;
    setActive(false);
    setError(err);
  }, []);

  const {
    supported,
    listening,
    interim,
    start: recStart,
    stop: recStop,
  } = useSpeech({ onResult, onEnd, onError });

  useEffect(() => {
    speechRef.current = { start: recStart, stop: recStop };
  }, [recStart, recStop]);

  const start = useCallback(() => {
    setError(null);
    setJournal([]);
    sessionRef.current = true;
    setActive(true);
    recStart();
  }, [recStart]);

  const stop = useCallback(() => {
    sessionRef.current = false;
    busyRef.current = false;
    setActive(false);
    setThinking(false);
    cancel();
    recStop();
  }, [cancel, recStop]);

  return {
    supported,
    active,
    listening,
    thinking,
    interim,
    journal,
    error,
    start,
    stop,
  };
}
