import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeech } from "./useSpeech";
import { useSpeak } from "./useSpeak";
import { interpretCommand, resolveAmbiguous } from "../utils/voiceCommands";

const TRANSIENT_ERRORS = new Set(["no-speech", "aborted"]);

// Half-duplex voice session: listens one utterance, executes the command,
// speaks the reply with the mic closed, then re-arms. See
// memory voice-session-half-duplex — never keep the mic open during TTS.
export function useVoiceSession({ voiceContext = {}, onVoiceCommand }) {
  const [journal, setJournal] = useState([]);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const sessionRef = useRef(false);
  const speakingRef = useRef(false);
  const pendingRef = useRef(null);
  const voiceRef = useRef(voiceContext);
  const cmdRef = useRef(onVoiceCommand);
  const speechRef = useRef(null);

  useEffect(() => {
    voiceRef.current = voiceContext;
  });
  useEffect(() => {
    cmdRef.current = onVoiceCommand;
  });

  const { speak, cancel } = useSpeak();

  const reArm = useCallback(() => {
    if (sessionRef.current && !speakingRef.current) speechRef.current?.start();
  }, []);

  const onResult = useCallback(
    (transcript) => {
      if (!transcript) return;
      const intent = pendingRef.current
        ? resolveAmbiguous(transcript, pendingRef.current)
        : interpretCommand(transcript, voiceRef.current);
      pendingRef.current = null;
      const result = cmdRef.current?.(intent) ?? { message: "" };
      if (result.pending) pendingRef.current = result.pending;
      if (result.message) {
        setJournal((j) => [...j, result.message].slice(-6));
        speakingRef.current = true;
        speak(result.message, () => {
          speakingRef.current = false;
          reArm();
        });
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
    speakingRef.current = false;
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
    speakingRef.current = false;
    pendingRef.current = null;
    setActive(false);
    cancel();
    recStop();
  }, [cancel, recStop]);

  return { supported, active, listening, interim, journal, error, start, stop };
}
