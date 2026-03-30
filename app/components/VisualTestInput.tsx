"use client";

import { useState, useRef } from "react";
import type { VisualScores } from "../types/analysis";

const AXES = [
  {
    key: "gazeDeviation" as const,
    label: "Gaze Deviation",
    description: "How often does your child avoid eye contact or look away from faces?",
    low: "Never avoids",
    high: "Always avoids",
    color: "blue",
  },
  {
    key: "patternFocus" as const,
    label: "Pattern Focus",
    description: "Does your child show intense interest in patterns, spinning objects, or geometric shapes?",
    low: "No interest",
    high: "Very intense",
    color: "purple",
  },
  {
    key: "socialStimuli" as const,
    label: "Social Stimuli Engagement",
    description: "Does your child look at faces, people, and social scenes?",
    low: "Rarely looks",
    high: "Always looks",
    color: "green",
    invert: true, // higher = more typical, so we don't invert in the API
  },
  {
    key: "repetitiveInterest" as const,
    label: "Repetitive Visual Interest",
    description: "Does your child repeatedly watch the same visual content (videos, lights, objects)?",
    low: "Not at all",
    high: "Constantly",
    color: "amber",
  },
  {
    key: "complexGeometric" as const,
    label: "Complex Geometric Preference",
    description: "Does your child seem more interested in abstract, geometric, or complex visuals than in people?",
    low: "Prefers people",
    high: "Prefers patterns",
    color: "rose",
  },
];

const COLOR_CLASSES: Record<string, { track: string; thumb: string; badge: string }> = {
  blue:   { track: "accent-blue-500",   thumb: "", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  purple: { track: "accent-purple-500", thumb: "", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  green:  { track: "accent-green-500",  thumb: "", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  amber:  { track: "accent-amber-500",  thumb: "", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  rose:   { track: "accent-rose-500",   thumb: "", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
};

type Props = {
  onSubmit: (scores: VisualScores) => void;
};

export default function VisualTestInput({ onSubmit }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({
    gazeDeviation: 0.5,
    patternFocus: 0.5,
    socialStimuli: 0.5,
    repetitiveInterest: 0.5,
    complexGeometric: 0.5,
  });
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setImageFile((ev.target?.result as string)?.split(",")[1] ?? null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const visualScores: VisualScores = {
      gazeDeviation: scores.gazeDeviation,
      patternFocus: scores.patternFocus,
      socialStimuli: scores.socialStimuli,
      repetitiveInterest: scores.repetitiveInterest,
      complexGeometric: scores.complexGeometric,
      ...(imageFile ? { imageFile } : {}),
    };
    onSubmit(visualScores);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
        <p className="font-bold mb-1">How to use this assessment</p>
        <p>Rate each visual attention dimension using the sliders below. Optionally upload a gaze-tracking result image or eye-contact photo for higher accuracy analysis.</p>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {AXES.map((axis) => {
          const val = scores[axis.key];
          const pct = Math.round(val * 100);
          const colors = COLOR_CLASSES[axis.color];
          return (
            <div key={axis.key} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {axis.label}
                  </span>
                </div>
                <span className="text-2xl font-black tabular-nums">{pct}%</span>
              </div>
              <p className="text-sm text-zinc-500 mb-4 mt-2">{axis.description}</p>
              <input
                type="range"
                min={0}
                max={100}
                value={pct}
                onChange={(e) => setScores((prev) => ({ ...prev, [axis.key]: Number(e.target.value) / 100 }))}
                className={`w-full h-2 rounded-full cursor-pointer ${colors.track}`}
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-1">
                <span>{axis.low}</span>
                <span>{axis.high}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional image upload */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <p className="font-bold">Optional: Upload Gaze-Tracking Image</p>
          <p className="text-xs text-zinc-400 mt-1">Attach a gaze-tracking screenshot or eye-contact photo. This improves model accuracy.</p>
        </div>
        <div
          className="p-8 flex flex-col items-center gap-3 text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-3xl">{imageFile ? "✅" : "🖼️"}</div>
          <p className="text-sm font-bold">
            {imageFileName || "Click to upload PNG / JPG / PDF"}
          </p>
          <p className="text-xs text-zinc-400">Max 10MB · Optional step</p>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl"
      >
        Analyse Visual Patterns →
      </button>
    </div>
  );
}
