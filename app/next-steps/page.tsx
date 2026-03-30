"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NextStepsPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-rose-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex justify-between items-center border-b border-white/10 backdrop-blur-xl bg-zinc-950/60">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-zinc-950 font-black text-sm">U</div>
          <span className="text-lg font-black tracking-tighter hidden sm:block">Uniquely Us</span>
        </Link>
        <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Title block */}
        <div className="text-center mb-14 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest text-zinc-300 backdrop-blur">
            ✅ Assessment Saved
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            What would you like to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              do next?
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Your results have been saved. Choose your next step — get expert
            guidance or join our therapeutic community.
          </p>
        </div>

        {/* Two Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

          {/* ── Option 1: Specialists ───────────────────── */}
          <button
            onClick={() => router.push("/specialists")}
            onMouseEnter={() => setHovered("specialists")}
            onMouseLeave={() => setHovered(null)}
            className="relative group text-left rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden p-8 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
          >
            {/* Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 space-y-5">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
                👨‍⚕️
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">Option 01</p>
                <h2 className="text-2xl font-black text-white mb-3">Connect with a Specialist</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Speak with licensed child psychiatrists, behavioral therapists, and speech-language pathologists who specialize in ASD support — tailored to your assessment results.
                </p>
              </div>

              {/* Feature list */}
              <ul className="space-y-2">
                {[
                  "Browse certified ASD specialists",
                  "Book video or in-person appointments",
                  "Share your assessment directly",
                  "Get a personalized care plan",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px] text-blue-400 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-2 font-black text-blue-400 group-hover:gap-3 transition-all">
                Find a Specialist <span>→</span>
              </div>
            </div>
          </button>

          {/* ── Option 2: Community ─────────────────────── */}
          <button
            onClick={() => router.push("/community")}
            onMouseEnter={() => setHovered("community")}
            onMouseLeave={() => setHovered(null)}
            className="relative group text-left rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden p-8 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-5">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30">
                🌟
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-1">Option 02</p>
                <h2 className="text-2xl font-black text-white mb-3">Join the Community Platform</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A safe, curated space where autistic kids thrive — therapeutic activities, creative expression, and a warm social community designed just for them.
                </p>
              </div>

              {/* Feature list */}
              <ul className="space-y-2">
                {[
                  "Therapeutic games & activities",
                  "Record audio stories & perspectives",
                  "Share drawings with deep meaning",
                  "Connect with kids like you",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-400 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-2 font-black text-purple-400 group-hover:gap-3 transition-all">
                Enter Community <span>→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Or skip */}
        <p className="mt-10 text-sm text-zinc-500">
          Not sure yet?{" "}
          <Link href="/dashboard" className="text-zinc-300 font-bold hover:text-white transition-colors underline underline-offset-4">
            Go to your dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
