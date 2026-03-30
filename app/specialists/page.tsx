"use client";

import { useState } from "react";
import Link from "next/link";

const SPECIALISTS = [
  {
    id: "sp-01",
    name: "Dr. Rani Sharma",
    title: "Child Psychiatrist",
    specialty: "ASD Diagnosis & Behavioral Intervention",
    initials: "RS",
    gradient: "from-blue-500 to-cyan-500",
    rating: 4.9,
    reviews: 214,
    experience: "12 yrs",
    available: true,
    nextSlot: "Today, 3:00 PM",
    tags: ["Behavioral Therapy", "DSM-5", "Early Intervention"],
    bio: "Dr. Sharma specializes in autism spectrum disorder across all age groups. She integrates sensory processing approaches with evidence-based behavioral strategies to create individualized treatment plans.",
    languages: ["English", "Hindi"],
    mode: ["Video", "In-Person"],
    fee: "₹1,200 / session",
  },
  {
    id: "sp-02",
    name: "Maya Agarwal",
    title: "Behavioral Therapist",
    specialty: "Applied Behavior Analysis (ABA)",
    initials: "MA",
    gradient: "from-purple-500 to-violet-500",
    rating: 4.8,
    reviews: 178,
    experience: "9 yrs",
    available: true,
    nextSlot: "Tomorrow, 11:00 AM",
    tags: ["ABA", "Social Skills", "Parent Training"],
    bio: "Maya uses ABA and naturalistic developmental approaches to build communication and adaptive skills. She also runs parent coaching sessions to extend therapy goals into everyday routines.",
    languages: ["English", "Marathi"],
    mode: ["Video"],
    fee: "₹900 / session",
  },
  {
    id: "sp-03",
    name: "Dr. Arjun Malhotra",
    title: "Speech-Language Pathologist",
    specialty: "AAC & Pragmatic Language",
    initials: "AM",
    gradient: "from-rose-500 to-orange-500",
    rating: 4.7,
    reviews: 143,
    experience: "7 yrs",
    available: false,
    nextSlot: "Wed, 2:00 PM",
    tags: ["AAC", "Speech Therapy", "Echolalia"],
    bio: "Dr. Malhotra focuses on augmentative communication and pragmatic language disorders. He helps non-verbal and minimally verbal autistic individuals find their voice through multi-modal communication tools.",
    languages: ["English", "Hindi", "Punjabi"],
    mode: ["Video", "In-Person"],
    fee: "₹1,000 / session",
  },
  {
    id: "sp-04",
    name: "Priya Nair",
    title: "Occupational Therapist",
    specialty: "Sensory Integration Therapy",
    initials: "PN",
    gradient: "from-green-500 to-emerald-500",
    rating: 4.9,
    reviews: 201,
    experience: "11 yrs",
    available: true,
    nextSlot: "Today, 5:30 PM",
    tags: ["Sensory Processing", "Fine Motor", "Daily Living"],
    bio: "Priya specializes in sensory integration and occupational performance for children on the spectrum. Her sessions are play-based and focus on building independence in self-care, school readiness, and social participation.",
    languages: ["English", "Malayalam", "Tamil"],
    mode: ["In-Person"],
    fee: "₹1,100 / session",
  },
];

const FILTERS = ["All", "Psychiatrist", "Behavioral", "Speech", "OT"];

export default function SpecialistsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);

  const filtered = SPECIALISTS.filter((s) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Psychiatrist") return s.title.includes("Psychiatrist");
    if (activeFilter === "Behavioral") return s.title.includes("Behavioral");
    if (activeFilter === "Speech") return s.title.includes("Speech");
    if (activeFilter === "OT") return s.title.includes("Occupational");
    return true;
  });

  const selected = SPECIALISTS.find((s) => s.id === selectedId);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-zinc-950 font-black text-sm">U</div>
            <span className="text-lg font-black tracking-tighter hidden sm:block">Uniquely Us</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm font-semibold text-zinc-300">Specialists</span>
        </div>
        <Link href="/next-steps" className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </header>

      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400">
            👨‍⚕️ Verified Specialists
          </div>
          <h1 className="text-4xl font-black tracking-tight">Connect with an Expert</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Every specialist on our platform is verified, ASD-specialized, and ready to support your journey.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap justify-center">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filtered.map((sp) => (
            <div
              key={sp.id}
              className={`relative rounded-2xl border bg-white/5 backdrop-blur p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                selectedId === sp.id
                  ? "border-blue-500/60 shadow-lg shadow-blue-500/20 bg-blue-500/10"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => setSelectedId(selectedId === sp.id ? null : sp.id)}
            >
              {/* Available badge */}
              <div className={`absolute top-4 right-4 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                sp.available ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sp.available ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`} />
                {sp.available ? "Available" : "Busy"}
              </div>

              {/* Avatar */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sp.gradient} flex items-center justify-center font-black text-lg text-white shadow-lg mb-4`}>
                {sp.initials}
              </div>

              <h3 className="font-black text-base">{sp.name}</h3>
              <p className="text-xs text-zinc-400 font-semibold mb-1">{sp.title}</p>
              <p className="text-xs text-zinc-500 mb-3">{sp.specialty}</p>

              {/* Rating + Exp */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">⭐ {sp.rating}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">{sp.reviews} reviews</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">{sp.experience}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {sp.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold">{t}</span>
                ))}
              </div>

              <div className="text-xs text-zinc-400 mb-1">Next slot: <span className="text-white font-bold">{sp.nextSlot}</span></div>
              <div className="text-xs text-zinc-400">Fee: <span className="text-white font-bold">{sp.fee}</span></div>
            </div>
          ))}
        </div>

        {/* Expanded Detail Panel */}
        {selected && (
          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className={`absolute inset-0 bg-gradient-to-br ${selected.gradient} opacity-[0.06]`} />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Bio */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center font-black text-xl text-white shadow-lg`}>
                      {selected.initials}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{selected.name}</h2>
                      <p className="text-zinc-400">{selected.title} · {selected.specialty}</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{selected.bio}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Languages</p>
                      <p className="text-white font-semibold">{selected.languages.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Mode</p>
                      <p className="text-white font-semibold">{selected.mode.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Session Fee</p>
                      <p className="text-white font-semibold">{selected.fee}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Book */}
                <div className="lg:w-72 space-y-4">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-5 space-y-3">
                    <p className="font-black text-base">Schedule a Session</p>
                    <p className="text-sm text-zinc-400">Next available: <span className="text-white font-bold">{selected.nextSlot}</span></p>
                    <div className="space-y-2">
                      {["Video Call (30 min)", "Video Call (60 min)", "In-Person (60 min)"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <div className="w-4 h-4 rounded-full border-2 border-zinc-600 group-hover:border-blue-400 transition-colors flex-shrink-0" />
                          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {booked === selected.id ? (
                      <div className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-black text-sm text-center">
                        ✅ Request Sent!
                      </div>
                    ) : (
                      <button
                        onClick={() => setBooked(selected.id)}
                        className={`w-full py-3 rounded-xl bg-gradient-to-r ${selected.gradient} text-white font-black text-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                      >
                        Book Appointment →
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center">Assessment results will be shared with the specialist automatically.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 px-6 py-6 border-t border-white/10 text-center text-xs text-zinc-500">
        © 2026 Uniquely Us · All specialists are verified ASD professionals
      </footer>
    </div>
  );
}
