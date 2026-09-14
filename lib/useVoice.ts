"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speech-to-text: uses the browser's native SpeechRecognition
 * (Web Speech API). Supported in Chrome, Edge, Safari; not in Firefox —
 * the mic button quietly disables itself there instead of erroring.
 */
export function useSpeechToText(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      onResultRef.current(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  return { listening, supported, toggle };
}

/**
 * Text-to-speech: tries the server /api/tts route (ElevenLabs) first for
 * natural voice quality; if that isn't configured (no ELEVENLABS key) or
 * fails, falls back to the browser's built-in speech synthesis so voice
 * output always works out of the box.
 */
export function useTextToSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }, []);

  const speakWithBrowserVoice = useCallback((id: string, text: string) => {
    if (!window.speechSynthesis) {
      setSpeakingId((cur) => (cur === id ? null : cur));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
    utterance.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (id: string, text: string) => {
      stop();
      setSpeakingId(id);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("tts route unavailable");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeakingId((cur) => (cur === id ? null : cur));
        audio.onerror = () => speakWithBrowserVoice(id, text);
        await audio.play();
      } catch {
        speakWithBrowserVoice(id, text);
      }
    },
    [stop, speakWithBrowserVoice]
  );

  return { speak, stop, speakingId };
}
