"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useDeepgramScribe() {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");

    // Get Deepgram key from server
    let key: string;
    try {
      const res = await fetch("/api/deepgram-key");
      const data = await res.json();
      if (!res.ok || !data.key) throw new Error(data.error ?? "Could not get API key");
      key = data.key;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to transcription service");
      return;
    }

    // Get microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setError("Microphone access denied. Please allow microphone permissions and try again.");
      return;
    }

    // Open Deepgram WebSocket
    const params = new URLSearchParams({
      model: "nova-2-medical",
      language: "en",
      smart_format: "true",
      punctuate: "true",
      interim_results: "true",
    });
    const ws = new WebSocket(
      `wss://api.deepgram.com/v1/listen?${params.toString()}`,
      ["token", key]
    );
    wsRef.current = ws;

    ws.onopen = () => {
      // Start MediaRecorder once WebSocket is ready
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(e.data);
        }
      };

      recorder.start(250); // send chunks every 250ms
      setIsRecording(true);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        const isFinal: boolean = msg?.is_final ?? false;
        const text: string = msg?.channel?.alternatives?.[0]?.transcript ?? "";
        if (isFinal && text.trim()) {
          setTranscript((prev) => (prev ? prev + " " + text : text));
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setError("Transcription connection error. Check your Deepgram API key.");
      setIsRecording(false);
    };

    ws.onclose = () => {
      setIsRecording(false);
    };
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      wsRef.current?.close();
    };
  }, []);

  return { transcript, isRecording, error, start, stop };
}
