// cspell:disable
import { AlertTriangle, Captions, Loader2, Pause, Play } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const API_URL = import.meta.env.VITE_API_URL;

interface AudioPlayerProps {
  src: string;
  autoTranscribe?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  autoTranscribe = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [hasError, setHasError] = useState(false);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTranscription = useCallback(async () => {
    if (isTranscribing) return;

    setIsTranscribing(true);
    setTranscription(null);
    setTranscriptionError(null);

    try {
      const audioResponse = await fetch(src);
      if (!audioResponse.ok) throw new Error("Failed to fetch audio file");
      const audioBlob = await audioResponse.blob();

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.mp3");

      const transcriptionResponse = await fetch(
        `${API_URL}/api/ai/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!transcriptionResponse.ok) {
        throw new Error("Server error");
      }

      const data = await transcriptionResponse.json();

      if (data.transcription) {
        setTranscription(data.transcription);
      } else {
        throw new Error("Vazio");
      }
    } catch (error) {
      setTranscriptionError("Erro na transcrição.");
    } finally {
      setIsTranscribing(false);
    }
  }, [src, isTranscribing]);

  useEffect(() => {
    if (autoTranscribe) {
      handleTranscription();
    }
  }, [autoTranscribe, handleTranscription]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous instance if exists to avoid duplication
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#94a3b8", // slate-400
        progressColor: "#6366f1", // indigo-500
        cursorColor: "transparent",
        barWidth: 3,
        barRadius: 3,
        barGap: 3,
        height: 32, // Explicit height is crucial
        url: src,
        normalize: true,
      });

      wavesurferRef.current = ws;

      ws.on("loading", () => setIsLoading(true));
      ws.on("ready", (d) => {
        setIsLoading(false);
        setDuration(formatTime(d));
      });
      ws.on("audioprocess", (t) => setCurrentTime(formatTime(t)));
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("finish", () => setIsPlaying(false));
      ws.on("error", (e) => {
        console.error("WaveSurfer Error:", e);
        setHasError(true);
        setIsLoading(false);
      });

      return () => {
        ws.destroy();
      };
    } catch (e) {
      console.error("Init Error", e);
      setHasError(true);
    }
  }, [src]);

  const handlePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 text-xs font-bold">
        <AlertTriangle size={16} /> Erro ao carregar áudio.
      </div>
    );
  }

  return (
    <div className="w-full min-w-[240px] max-w-md space-y-2">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 p-2 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all shrink-0 shadow-md ${
            isLoading ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="flex-1 h-8 flex items-center justify-center opacity-80">
          <div ref={containerRef} className="w-full" />
        </div>

        <div className="flex flex-col items-end shrink-0 pl-2 border-l border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-mono">
            {currentTime}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            {duration}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start px-2">
        <button
          onClick={handleTranscription}
          disabled={isTranscribing || !!transcription}
          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 disabled:opacity-50 transition-colors"
        >
          {isTranscribing ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Captions size={10} />
          )}
          {transcription ? "Transcrito" : "Transcrever Áudio"}
        </button>
      </div>

      {/* Transcription results */}
      {(transcriptionError || transcription) && (
        <div
          className={`p-3 text-xs rounded-xl border animate-in fade-in slide-in-from-top-2 ${
            transcriptionError
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}
        >
          {transcriptionError ? (
            transcriptionError
          ) : (
            <p className="italic">"{transcription}"</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
