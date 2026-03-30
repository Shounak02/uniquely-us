"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import type { AnalysisResult, Intervention, NextStep } from "../../types/analysis";

const RISK_STYLES = {
  Low:      { badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",  ring: "stroke-green-500",  dot: "bg-green-500",  label: "Low Risk" },
  Moderate: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",  ring: "stroke-amber-500",  dot: "bg-amber-500",  label: "Moderate Risk" },
  High:     { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",          ring: "stroke-red-500",    dot: "bg-red-500",    label: "High Risk" },
};

const ASD_LEVEL_COLORS = {
  "Level 1 — Requiring Support":                    "from-amber-500 to-orange-500",
  "Level 2 — Requiring Substantial Support":        "from-orange-500 to-red-500",
  "Level 3 — Requiring Very Substantial Support":   "from-red-500 to-rose-600",
  "Sub-threshold — No ASD Indicated":               "from-green-500 to-emerald-500",
};

const MODEL_ICONS: Record<string, string> = {
  behavioral: "🧠",
  visual:     "👁️",
  speech:     "🎙️",
};

const PRIORITY_STYLE = {
  High:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

// Confidence gauge SVG (circular)
function ConfidenceGauge({ value }: { value: number }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center -mt-[72px] mb-12">
        <div className="text-3xl font-black">{value}%</div>
        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Confidence</div>
      </div>
    </div>
  );
}

// Score bar for individual findings
function ScoreBar({ score, label, comment }: { score: number; label: string; comment: string }) {
  const color = score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">{label}</span>
        <span className="text-sm font-black tabular-nums">{score}</span>
      </div>
      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-zinc-500">{comment}</p>
    </div>
  );
}

export default function ResultsPage() {
  const { isLoggedIn, addTestResult } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("latestTestResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        router.push("/test");
      }
    } else {
      router.push("/test");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-950 dark:border-zinc-800 dark:border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading results…</p>
        </div>
      </div>
    );
  }

  const riskStyles = RISK_STYLES[result.riskLevel];
  const levelGradient = ASD_LEVEL_COLORS[result.asdLevel] ?? "from-zinc-400 to-zinc-600";
  const formattedDate = new Date(result.timestamp).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handleSave = async () => {
    if (result) {
      // Convert AnalysisResult -> TestResult and save to user's history in session
      await addTestResult({
        modelName: result.modelName,
        date: new Date(result.timestamp).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        }),
        score: Math.round(result.overallScore),
        risk: result.riskLevel,
        summary: result.summary,
      });
    }
    setSaved(true);
    setTimeout(() => router.push("/next-steps"), 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm">U</div>
          <span className="text-lg font-black tracking-tighter hidden sm:block">Uniquely Us</span>
        </div>
        <div className="flex gap-2">
          <Link href="/test" className="px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            New Test
          </Link>
          <Link href="/dashboard" className="px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 py-10 space-y-8">

        {/* ── HERO RESULT BANNER ─────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${levelGradient} p-8 text-white shadow-2xl`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{MODEL_ICONS[result.modelId]}</span>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{result.modelName}</p>
                  <p className="text-white/60 text-xs">{formattedDate}</p>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">{result.asdLevel}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur`}>
                  <span className={`w-2 h-2 rounded-full ${riskStyles.dot}`} />
                  {riskStyles.label}
                </span>
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur">
                  Score: {result.overallScore}/100
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ConfidenceGauge value={result.confidence} />
            </div>
          </div>
        </div>

        {/* ── SUMMARY ────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-black mb-3">Assessment Summary</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{result.summary}</p>
        </div>

        {/* ── 2-col layout: Findings + Sidebar ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Findings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-black mb-6">Detailed Findings</h2>
              <div className="space-y-6">
                {result.findings.map((f, i) => (
                  <ScoreBar key={i} score={f.score} label={f.label} comment={f.comment} />
                ))}
              </div>
            </div>

            {/* Interventions */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-black">Recommended Parallel Interventions</h2>
                <p className="text-sm text-zinc-500 mt-1">Evidence-based strategies aligned with the assessed spectrum level</p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {result.interventions.map((iv: Intervention, i: number) => (
                  <div key={i} className="p-5 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm">{iv.type}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${PRIORITY_STYLE[iv.priority]}`}>
                          {iv.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed">{iv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-black">What to Do Next</h2>
                <p className="text-sm text-zinc-500 mt-1">Recommended actions based on your result</p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {result.nextSteps.map((ns: NextStep) => (
                  <div key={ns.order} className="p-5 flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                      {ns.order}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ns.action}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{ns.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Save to Dashboard */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg">
              <h3 className="font-black text-lg mb-2">💾 Save Results</h3>
              <p className="text-blue-100 text-sm mb-4">
                {isLoggedIn
                  ? "Save this test to your dashboard to track your history and compare results over time."
                  : "Log in to save this result to your personal dashboard."}
              </p>
              {isLoggedIn ? (
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="w-full py-3 bg-white text-blue-700 rounded-xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {saved ? "✅ Saved! Redirecting…" : "Save to My Dashboard"}
                </button>
              ) : (
                <Link href="/login" className="block w-full py-3 bg-white text-blue-700 rounded-xl font-black text-sm text-center hover:opacity-90">
                  Log In to Save
                </Link>
              )}
            </div>

            {/* ASD Level Key */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-black text-sm">DSM-5 ASD Levels</h3>
              {(Object.entries(ASD_LEVEL_COLORS) as [string, string][]).map(([level, grad]) => (
                <div key={level} className={`flex items-start gap-2 p-2 rounded-lg ${result.asdLevel === level ? "bg-zinc-50 dark:bg-zinc-800 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700" : ""}`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${grad} mt-1 flex-shrink-0`} />
                  <p className={`text-xs leading-snug ${result.asdLevel === level ? "font-black" : "text-zinc-400"}`}>{level}</p>
                </div>
              ))}
            </div>

            {/* Run another */}
            <div className="space-y-2">
              <Link
                href="/test"
                className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl font-black text-sm hover:opacity-90 transition-all"
              >
                🔁 Run Another Test
              </Link>
              <Link
                href="/upload-report"
                className="flex items-center justify-center gap-2 w-full py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-black text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                📤 Upload Clinical Report
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 leading-relaxed">
              <p className="font-bold text-zinc-500 mb-1">Important</p>
              {result.disclaimer}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        © 2026 Uniquely Us · AI screening is not a substitute for clinical evaluation
      </footer>
    </div>
  );
}
