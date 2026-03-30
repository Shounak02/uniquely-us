"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import TestQuestionnaire from "../components/TestQuestionnaire";
import VisualTestInput from "../components/VisualTestInput";
import SpeechTestInput from "../components/SpeechTestInput";
import type { AnalysisResult, BehavioralAnswers, VisualScores, SpeechInputs } from "../types/analysis";

const MODELS = [
  {
    id: "behavioral",
    name: "Behavioral Analysis",
    icon: "🧠",
    description: "Evaluates social interaction, communication patterns and repetitive behaviors using a DSM-5 aligned questionnaire.",
    tags: ["Questionnaire", "20 Questions", "~8 mins"],
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "visual",
    name: "Visual Pattern Recognition",
    icon: "👁️",
    description: "Analyses gaze deviation, pattern focus, and social stimuli engagement with optional image upload.",
    tags: ["Sliders", "Image Upload", "~5 mins"],
    gradient: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    id: "speech",
    name: "Speech Pattern Analysis",
    icon: "🎙️",
    description: "Detects prosodic variation, echolalia, and pragmatic language patterns via text, audio, or rated features.",
    tags: ["Audio Upload", "Text Input", "~6 mins"],
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
  },
];

type Step = "selection" | "input" | "processing" | "error";

export default function TestPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [step, setStep] = useState<Step>("selection");
  const [progressLabel, setProgressLabel] = useState("Initialising model…");
  const [apiError, setApiError] = useState("");

  const selectedModel = MODELS.find((m) => m.id === selectedModelId)!;

  // ── SUBMIT HANDLERS per model ──────────────────────────────────────────────

  const runAnalysis = async (endpoint: string, payload: object) => {
    setStep("processing");
    setProgressLabel("Sending data to model…");

    const stages = [
      "Pre-processing inputs…",
      "Running inference…",
      "Scoring responses…",
      "Generating report…",
    ];
    let stageIdx = 0;
    const intervalId = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setProgressLabel(stages[stageIdx]);
    }, 1200);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(intervalId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Server error ${res.status}`);
      }

      const result: AnalysisResult = await res.json();
      // Store result in sessionStorage so the results page can read it
      sessionStorage.setItem("latestTestResult", JSON.stringify(result));
      router.push("/test/results");
    } catch (err: unknown) {
      clearInterval(intervalId);
      setApiError(err instanceof Error ? err.message : "An unknown error occurred.");
      setStep("error");
    }
  };

  const handleBehavioral = (answers: BehavioralAnswers) => {
    runAnalysis("/api/analyze/behavioral", { modelId: "behavioral", answers });
  };

  const handleVisual = (scores: VisualScores) => {
    runAnalysis("/api/analyze/visual", { modelId: "visual", scores });
  };

  const handleSpeech = (inputs: SpeechInputs) => {
    runAnalysis("/api/analyze/speech", { modelId: "speech", inputs });
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm">U</div>
            <span className="text-lg font-black tracking-tighter hidden sm:block">Uniquely Us</span>
          </Link>
          {step !== "selection" && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>/</span>
              <span className="font-semibold">{selectedModel.name}</span>
            </div>
          )}
        </div>
        <Link href="/dashboard" className="px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          ← Dashboard
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-10">

        {/* ── STEP 1: Model Selection ─────────────────────────────────── */}
        {step === "selection" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500">
                Step 1 of 3 — Choose Your Assessment
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Select Detection Model</h1>
              <p className="text-zinc-500 max-w-xl mx-auto">
                Each model focuses on a different dimension of ASD screening. Choose the one most appropriate for the current assessment, or run all three for a comprehensive picture.
              </p>
            </div>

            {/* Model Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`relative p-6 text-left rounded-2xl border-2 transition-all group ${
                    selectedModelId === model.id
                      ? `${model.border} shadow-lg scale-[1.02] bg-white dark:bg-zinc-900`
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50"
                  }`}
                >
                  {selectedModelId === model.id && (
                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br ${model.gradient} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${model.lightBg} flex items-center justify-center text-2xl mb-4`}>
                    {model.icon}
                  </div>
                  <h3 className="font-black text-base mb-2">{model.name}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{model.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {model.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Info about selected model */}
            <div className={`rounded-2xl p-5 border ${selectedModel.border} ${selectedModel.lightBg}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedModel.icon}</span>
                <div>
                  <p className="font-black text-sm">{selectedModel.name} selected</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selectedModel.description}</p>
                </div>
              </div>
            </div>

            {/* Important notice */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
              <p className="font-bold mb-1">⚠️ Clinical Disclaimer</p>
              <p>This assessment is an AI-assisted screening tool only. Results are not a medical diagnosis. Always consult a qualified healthcare professional before making clinical or educational decisions.</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep("input")}
                className={`px-12 py-4 bg-gradient-to-r ${selectedModel.gradient} text-white rounded-2xl font-black text-lg hover:opacity-90 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                Begin {selectedModel.name} →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Input Collection ──────────────────────────────────── */}
        {step === "input" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("selection")}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ←
              </button>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">Step 2 of 3 — Provide Input</div>
                <h2 className="text-2xl font-black">{selectedModel.name}</h2>
              </div>
            </div>

            {selectedModelId === "behavioral" && <TestQuestionnaire onSubmit={handleBehavioral} />}
            {selectedModelId === "visual"     && <VisualTestInput onSubmit={handleVisual} />}
            {selectedModelId === "speech"     && <SpeechTestInput onSubmit={handleSpeech} />}
          </div>
        )}

        {/* ── STEP 3: Processing ───────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in-95 duration-400">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${selectedModel.gradient} flex items-center justify-center text-4xl shadow-2xl animate-pulse`}>
              {selectedModel.icon}
            </div>
            <div className="text-center space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-zinc-400">Step 3 of 3 — Analysing</div>
              <h2 className="text-2xl font-black">Running {selectedModel.name}</h2>
              <p className="text-zinc-400 font-medium">{progressLabel}</p>
            </div>
            {/* Animated progress bar */}
            <div className="w-72 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${selectedModel.gradient} rounded-full animate-[progress_1.8s_ease-in-out_infinite]`} style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-zinc-400 max-w-xs text-center">
              Powered by AI — results are generated in seconds. Do not close this tab.
            </p>
          </div>
        )}

        {/* ── ERROR ───────────────────────────────────────────────────── */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-400">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-4xl">⚠️</div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-red-600 dark:text-red-400">Analysis Failed</h2>
              <p className="text-zinc-500 max-w-sm">{apiError}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("input")}
                className="px-6 py-3 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-xl font-bold hover:opacity-90"
              >
                Try Again
              </button>
              <button
                onClick={() => setStep("selection")}
                className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Change Model
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-900">
        Note: This is an AI-assisted screening tool, not a clinical diagnosis. Results should be reviewed by a qualified professional.
      </footer>
    </div>
  );
}
