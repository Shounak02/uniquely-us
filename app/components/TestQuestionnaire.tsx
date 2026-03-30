"use client";

import { useState } from "react";
import type { BehavioralAnswers } from "../types/analysis";

export const QUESTIONS = [
  { id: "q01", domain: "Social Reciprocity",    text: "My child makes eye contact during conversations." },
  { id: "q02", domain: "Social Reciprocity",    text: "My child responds when their name is called." },
  { id: "q03", domain: "Social Reciprocity",    text: "My child shares enjoyment or interests by pointing or showing." },
  { id: "q04", domain: "Social Reciprocity",    text: "My child understands others' emotions and feelings." },
  { id: "q05", domain: "Communication",         text: "My child uses words or phrases to communicate needs." },
  { id: "q06", domain: "Communication",         text: "My child can maintain a back-and-forth conversation." },
  { id: "q07", domain: "Communication",         text: "My child uses gestures (waving, pointing) to communicate." },
  { id: "q08", domain: "Communication",         text: "My child uses facial expressions appropriately in context." },
  { id: "q09", domain: "Repetitive Behaviors",  text: "My child lines up toys or objects in a specific order." },
  { id: "q10", domain: "Repetitive Behaviors",  text: "My child insists on following the same routines daily." },
  { id: "q11", domain: "Repetitive Behaviors",  text: "My child repeats words or phrases out of context." },
  { id: "q12", domain: "Repetitive Behaviors",  text: "My child has repetitive motor movements (hand-flapping, rocking)." },
  { id: "q13", domain: "Restricted Interests",  text: "My child is intensely focused on very specific topics." },
  { id: "q14", domain: "Restricted Interests",  text: "My child is highly distressed by changes to their routine." },
  { id: "q15", domain: "Restricted Interests",  text: "My child shows unusual attachment to specific objects." },
  { id: "q16", domain: "Sensory",               text: "My child is over-sensitive to sounds, textures, or lights." },
  { id: "q17", domain: "Sensory",               text: "My child seeks out intense sensory experiences (spinning, pressure)." },
  { id: "q18", domain: "Sensory",               text: "My child is under-responsive to pain or temperature." },
  { id: "q19", domain: "Adaptive Behavior",     text: "My child adapts easily to new environments or people." },
  { id: "q20", domain: "Adaptive Behavior",     text: "My child can independently manage daily self-care tasks." },
];

export const SCALE = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always" },
];

const DOMAIN_COLORS: Record<string, string> = {
  "Social Reciprocity":    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Communication":         "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Repetitive Behaviors":  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Restricted Interests":  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "Sensory":               "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Adaptive Behavior":     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

type Props = {
  onSubmit: (answers: BehavioralAnswers) => void;
};

export default function TestQuestionnaire({ onSubmit }: Props) {
  const [answers, setAnswers] = useState<BehavioralAnswers>({});
  const [error, setError] = useState("");

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  const handleSubmit = () => {
    if (answered < QUESTIONS.length) {
      setError(`Please answer all ${QUESTIONS.length} questions. You have ${QUESTIONS.length - answered} remaining.`);
      return;
    }
    setError("");
    onSubmit(answers);
  };

  // Group questions by domain
  const domains = [...new Set(QUESTIONS.map((q) => q.domain))];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 sticky top-20 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
            {answered} / {QUESTIONS.length} answered
          </p>
          <span className="text-sm font-black text-zinc-950 dark:text-zinc-50">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1.5">Rate how often each behavior occurs using the 1–5 scale below each question.</p>
      </div>

      {/* Questions grouped by domain */}
      {domains.map((domain) => (
        <div key={domain} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className={`px-6 py-3 border-b border-zinc-100 dark:border-zinc-800`}>
            <span className={`inline-block text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${DOMAIN_COLORS[domain]}`}>
              {domain}
            </span>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {QUESTIONS.filter((q) => q.domain === domain).map((q, i) => (
              <div key={q.id} className="px-6 py-5">
                <p className="font-medium text-sm mb-4 leading-relaxed">
                  <span className="text-zinc-400 font-black mr-2">#{QUESTIONS.indexOf(q) + 1}</span>
                  {q.text}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: s.value }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-bold ${
                        answers[q.id] === s.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-105"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-400"
                      }`}
                    >
                      <span className="text-lg font-black">{s.value}</span>
                      <span className="leading-none text-[9px] text-center">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Error & Submit */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl"
      >
        Analyse My Responses →
      </button>
    </div>
  );
}
