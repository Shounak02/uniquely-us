"use client";

import { useState, useRef } from "react";
import type { SpeechInputs } from "../types/analysis";

const FEATURE_AXES = [
  { key: "prosodyVariation",  label: "Prosodic Variation",   low: "Very typical rhythm", high: "Very atypical/flat",       desc: "How atypical is the rhythm, stress, and intonation when they speak?" },
  { key: "repetitionRate",   label: "Repetitive Phrasing",   low: "No repetition",       high: "Constant repetition",       desc: "How often does your child repeat words, phrases, or sentences?" },
  { key: "echolaliaScore",   label: "Echolalia",             low: "Never echoes",        high: "Frequent echolalia",        desc: "Does your child repeat words/phrases they have heard (from TV, others, etc.)?" },
  { key: "socialPhrasing",   label: "Social Language Use",   low: "Limited social speech",high: "Rich social language",     desc: "How well does your child use greetings, questions, and conversational phrases?" },
] as const;

type FeatureKey = typeof FEATURE_AXES[number]["key"];

type Props = {
  onSubmit: (inputs: SpeechInputs) => void;
};

export default function SpeechTestInput({ onSubmit }: Props) {
  const [mode, setMode] = useState<"features" | "text" | "audio">("features");
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [features, setFeatures] = useState<Record<FeatureKey, number>>({
    prosodyVariation: 0.5,
    repetitionRate: 0.5,
    echolaliaScore: 0.5,
    socialPhrasing: 0.5,
  });
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setAudioFile((ev.target?.result as string)?.split(",")[1] ?? null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (mode === "text" && transcription.trim().length < 20) {
      setError("Please enter at least 20 characters of transcribed speech.");
      return;
    }
    if (mode === "audio" && !audioFile) {
      setError("Please upload an audio file.");
      return;
    }
    setError("");

    const inputs: SpeechInputs = {
      ...(mode === "text"     ? { transcription } : {}),
      ...(mode === "audio"    ? { audioFileBase64: audioFile!, durationSeconds } : {}),
      ...(mode === "features" ? { features } : {}),
    };
    onSubmit(inputs);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="font-bold text-sm">Choose assessment method</p>
        </div>
        <div className="grid grid-cols-3 gap-0 divide-x divide-zinc-100 dark:divide-zinc-800">
          {[
            { id: "features" as const, icon: "🎚️", label: "Rate Features",  desc: "Use sliders to rate speech characteristics" },
            { id: "text"     as const, icon: "📝", label: "Paste Text",      desc: "Transcribe a speech sample to analyse" },
            { id: "audio"    as const, icon: "🎙️", label: "Upload Audio",   desc: "Upload a voice recording (wav/mp3)" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-1.5 p-5 text-center transition-all ${
                mode === m.id
                  ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-400"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-sm font-black">{m.label}</span>
              <span className="text-[10px] leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Sliders Mode */}
      {mode === "features" && (
        <div className="space-y-4">
          {FEATURE_AXES.map((axis) => {
            const pct = Math.round(features[axis.key] * 100);
            return (
              <div key={axis.key} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black">{axis.label}</span>
                  <span className="text-2xl font-black tabular-nums">{pct}%</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">{axis.desc}</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) =>
                    setFeatures((prev) => ({ ...prev, [axis.key]: Number(e.target.value) / 100 }))
                  }
                  className="w-full h-2 rounded-full cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-1">
                  <span>{axis.low}</span>
                  <span>{axis.high}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Text Transcription Mode */}
      {mode === "text" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <p className="font-bold">Paste or type a speech sample</p>
            <p className="text-xs text-zinc-400 mt-1">At least 2-3 minutes of your child's speech works best. You can write it as they speak or transcribe a recording.</p>
          </div>
          <div className="p-5">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={8}
              placeholder="Type or paste the speech sample here. For example: 'The train goes fast. Fast train. I like trains. Trains have wheels. Wheels go round and round...'"
              className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-zinc-400 mt-2">{transcription.split(/\s+/).filter(Boolean).length} words entered</p>
          </div>
        </div>
      )}

      {/* Audio Upload Mode */}
      {mode === "audio" && (
        <div className="space-y-4">
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 shadow-sm p-10 flex flex-col items-center gap-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-4xl">{audioFile ? "✅" : "🎙️"}</div>
            <div>
              <p className="font-bold">{audioFileName || "Click to upload audio file"}</p>
              <p className="text-xs text-zinc-400 mt-1">WAV, MP3, M4A · Max 25MB</p>
            </div>
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
          </div>
          {audioFile && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <label className="block text-sm font-bold mb-2">Recording duration (seconds)</label>
              <input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="e.g. 120"
                min={5}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl"
      >
        Analyse Speech Patterns →
      </button>
    </div>
  );
}
