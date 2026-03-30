"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

type PostType = "Drawing" | "Audio" | "Story" | "Activity" | string;
type TabType = "feed" | "activities" | "create" | "friends";

interface Post {
  id: string;
  author: {
    firstName: string;
    lastName: string;
    avatarInitials: string;
  };
  type: PostType;
  content: string;
  caption?: string;
  likes: number;
  date: string;
  comments?: { id: string, author: string, text: string }[];
}

// ── Activities Data ───────────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    id: "act-1",
    title: "Calm Breathing Garden",
    desc: "Follow the breathing flower and feel the calm wash over you.",
    emoji: "🌸",
    gradient: "from-green-500 to-teal-500",
    category: "Mindfulness",
    duration: "2 min",
    xp: 100,
    difficulty: "Easy",
    steps: ["Breathe in as the flower grows...", "Hold for a moment...", "Breathe out as it shrinks..."],
    options: [],
    isPictogram: false,
  },
  {
    id: "act-2",
    title: "Emotion Matching",
    desc: "Match the feelings on faces to words — build your emotion vocabulary!",
    emoji: "😊",
    gradient: "from-yellow-500 to-orange-500",
    category: "Social Skills",
    duration: "3 min",
    xp: 150,
    difficulty: "Easy",
    steps: ["Look at this big smile! 😃", "How do you think they feel?", "Wait for the next face..."],
    options: ["Happy", "Excited", "Proud", "Joyful"],
    isPictogram: false,
  },
  {
    id: "act-4",
    title: "Pattern Puzzler",
    desc: "Spot the patterns! Strengthen visual thinking and focus.",
    emoji: "🔷",
    gradient: "from-blue-500 to-indigo-500",
    category: "Cognitive",
    duration: "4 min",
    xp: 120,
    difficulty: "Medium",
    steps: ["Red 🔴, Blue 🔵, Red 🔴, ...", "What color comes next in the logic train?", "Pattern solved!"],
    options: ["Blue 🔵", "Green 🟢", "Yellow 🟡", "Red 🔴"],
    isPictogram: false,
  },
  {
    id: "act-picto",
    title: "Pictogram Talk",
    desc: "Tap picture symbols to build sentences and express yourself — your voice, your way!",
    emoji: "🗣️",
    gradient: "from-fuchsia-500 to-rose-500",
    category: "Communication",
    duration: "5 min",
    xp: 175,
    difficulty: "Easy",
    steps: [],
    options: [],
    isPictogram: true,
  },
];

const MOCK_POSTS: Post[] = [
  { id: "m1", type: "Drawing", content: "A sunny day with my cat! 🐈", author: { firstName: "Aarav", lastName: "P.", avatarInitials: "AP" }, likes: 12, date: "Today, 10:45 AM" },
  { id: "m2", type: "Story", content: "Today I learned that space is very big and quiet. I want to be an astronaut! 👨‍🚀", author: { firstName: "Sanya", lastName: "G.", avatarInitials: "SG" }, likes: 8, date: "Today, 9:20 AM" },
  { id: "m3", type: "Audio", content: "Voice recording of my favourite song 🎤", author: { firstName: "Rohan", lastName: "M.", avatarInitials: "RM" }, likes: 15, date: "Yesterday, 4:15 PM" },
  { id: "m4", type: "Activity", content: "Just finished Calm Breathing Garden! I feel 100% better. 🌸", author: { firstName: "Zara", lastName: "K.", avatarInitials: "ZK" }, likes: 24, date: "Yesterday, 2:30 PM" },
  { id: "m5", type: "Drawing", content: "My superhero self! 🦸‍♂️", author: { firstName: "Ishan", lastName: "T.", avatarInitials: "IT" }, likes: 31, date: "March 28" },
];

const POST_TYPE_ICONS: Record<string, string> = {
  Drawing: "🎨",
  Audio: "🎙️",
  Story: "📖",
  Activity: "🎯",
};

// ── Pictogram AAC Board ───────────────────────────────────────────────────────

const PICTO_CATEGORIES = [
  {
    id: "feelings",
    label: "Feelings",
    color: "from-yellow-500 to-orange-500",
    borderColor: "border-yellow-500/40",
    bgActive: "bg-yellow-500/20",
    emoji: "💛",
    items: [
      { id: "p-happy",   emoji: "😊", label: "Happy" },
      { id: "p-sad",     emoji: "😢", label: "Sad" },
      { id: "p-scared",  emoji: "😨", label: "Scared" },
      { id: "p-angry",   emoji: "😠", label: "Angry" },
      { id: "p-calm",    emoji: "😌", label: "Calm" },
      { id: "p-excited", emoji: "🤩", label: "Excited" },
      { id: "p-tired",   emoji: "😴", label: "Tired" },
      { id: "p-loved",   emoji: "🥰", label: "Loved" },
    ],
  },
  {
    id: "needs",
    label: "I Need",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/40",
    bgActive: "bg-blue-500/20",
    emoji: "💙",
    items: [
      { id: "p-help",    emoji: "🙋", label: "Help" },
      { id: "p-break",   emoji: "⏸️", label: "A Break" },
      { id: "p-water",   emoji: "💧", label: "Water" },
      { id: "p-quiet",   emoji: "🤫", label: "Quiet" },
      { id: "p-hug",     emoji: "🤗", label: "A Hug" },
      { id: "p-toilet",  emoji: "🚻", label: "Toilet" },
      { id: "p-play",    emoji: "🎲", label: "To Play" },
      { id: "p-eat",     emoji: "🍽️", label: "To Eat" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    color: "from-green-500 to-teal-500",
    borderColor: "border-green-500/40",
    bgActive: "bg-green-500/20",
    emoji: "💚",
    items: [
      { id: "p-go",     emoji: "🏃", label: "Go" },
      { id: "p-stop",   emoji: "✋", label: "Stop" },
      { id: "p-sit",    emoji: "🪑", label: "Sit" },
      { id: "p-listen", emoji: "👂", label: "Listen" },
      { id: "p-look",   emoji: "👀", label: "Look" },
      { id: "p-read",   emoji: "📖", label: "Read" },
      { id: "p-draw",   emoji: "✏️", label: "Draw" },
      { id: "p-sing",   emoji: "🎵", label: "Sing" },
    ],
  },
  {
    id: "food",
    label: "Food",
    color: "from-rose-500 to-pink-500",
    borderColor: "border-rose-500/40",
    bgActive: "bg-rose-500/20",
    emoji: "🍎",
    items: [
      { id: "p-apple",   emoji: "🍎", label: "Apple" },
      { id: "p-milk",    emoji: "🥛", label: "Milk" },
      { id: "p-banana",  emoji: "🍌", label: "Banana" },
      { id: "p-bread",   emoji: "🍞", label: "Bread" },
      { id: "p-rice",    emoji: "🍚", label: "Rice" },
      { id: "p-cookie",  emoji: "🍪", label: "Cookie" },
      { id: "p-juice",   emoji: "🧃", label: "Juice" },
      { id: "p-egg",     emoji: "🥚", label: "Egg" },
    ],
  },
  {
    id: "places",
    label: "Places",
    color: "from-purple-500 to-violet-500",
    borderColor: "border-purple-500/40",
    bgActive: "bg-purple-500/20",
    emoji: "💜",
    items: [
      { id: "p-home",    emoji: "🏠", label: "Home" },
      { id: "p-school",  emoji: "🏫", label: "School" },
      { id: "p-park",    emoji: "🌳", label: "Park" },
      { id: "p-doctor",  emoji: "🏥", label: "Doctor" },
      { id: "p-shop",    emoji: "🛒", label: "Shop" },
      { id: "p-toilet2", emoji: "🚽", label: "Bathroom" },
      { id: "p-car",     emoji: "🚗", label: "Car" },
      { id: "p-bed",     emoji: "🛏️", label: "Bed" },
    ],
  },
];

type PictoItem = { id: string; emoji: string; label: string };

function PictogramActivity({ onComplete, onCancel }: { onComplete: (xp: number) => void; onCancel: () => void }) {
  const { sharePost } = useAuth();
  const [activeCategory, setActiveCategory] = useState(PICTO_CATEGORIES[0]);
  const [sentence, setSentence] = useState<PictoItem[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const addSymbol = (item: PictoItem) => {
    if (sentence.length >= 8) return;
    setSentence(prev => [...prev, item]);
  };

  const removeLastSymbol = () => setSentence(prev => prev.slice(0, -1));
  const clearSentence = () => setSentence([]);

  const speakSentence = () => {
    if (!sentence.length || speaking) return;
    const text = sentence.map(s => s.label).join(" ");
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const shareSentence = async () => {
    if (!sentence.length) return;
    
    // Format the shared content
    const emotionOrAction = sentence.map(s => s.label).join(" ");
    const visualSentence = sentence.map(s => s.emoji).join(" ");
    
    try {
      await sharePost({
        type: "Activity",
        content: `${visualSentence}\n(${emotionOrAction})`,
        caption: "Pictogram Expression"
      });
    } catch (e) {
      console.error(e);
    }

    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    setCelebrated(true);
    setSentence([]);
    setTimeout(() => setCelebrated(false), 2000);
  };

  const handleDone = () => onComplete(175);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col text-white overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-2xl shadow-2xl shadow-fuchsia-500/30">
            🗣️
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Pictogram Talk</h2>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.25em]">AAC Communication Board</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {completedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full">
              <span className="text-fuchsia-400 text-sm font-black">{completedCount} ✦</span>
              <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider">sentences shared</span>
            </div>
          )}
          <button
            onClick={handleDone}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-600 font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-fuchsia-500/20"
          >
            Done (+175 XP)
          </button>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Sentence Strip */}
      <div className="relative z-10 px-6 py-4 border-b border-white/5 bg-zinc-900/40 backdrop-blur">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">My Sentence</span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-zinc-600 font-bold">{sentence.length}/8 symbols</span>
        </div>
        <div className="flex items-center gap-3 min-h-[90px]">
          {/* Symbol slots */}
          <div className="flex-1 flex gap-2.5 flex-wrap items-center">
            {sentence.length === 0 ? (
              <div className="flex items-center gap-3 text-zinc-700">
                <div className="w-[72px] h-[72px] rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl opacity-30">💬</span>
                </div>
                <p className="text-sm font-bold text-zinc-600">Tap a symbol below to start talking!</p>
              </div>
            ) : (
              sentence.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  className="relative group w-[72px] h-[72px] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 animate-in zoom-in-75 duration-200"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 text-center leading-tight">{item.label}</span>
                </div>
              ))
            )}
          </div>
          {/* Controls */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={speakSentence}
              disabled={!sentence.length || speaking}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                speaking
                  ? "bg-fuchsia-500 text-white animate-pulse shadow-lg shadow-fuchsia-500/40"
                  : sentence.length
                  ? "bg-white/10 hover:bg-fuchsia-500/20 hover:text-fuchsia-300 border border-white/10"
                  : "bg-white/5 text-zinc-700 cursor-not-allowed"
              }`}
              title="Speak sentence"
            >
              🔊
            </button>
            <button
              onClick={shareSentence}
              disabled={!sentence.length}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                sentence.length
                  ? "bg-white/10 hover:bg-green-500/20 hover:text-green-300 border border-white/10"
                  : "bg-white/5 text-zinc-700 cursor-not-allowed"
              }`}
              title="Share sentence"
            >
              ✅
            </button>
            <button
              onClick={removeLastSymbol}
              disabled={!sentence.length}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                sentence.length
                  ? "bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10"
                  : "bg-white/5 text-zinc-700 cursor-not-allowed"
              }`}
              title="Undo last symbol"
            >
              ↩️
            </button>
            <button
              onClick={clearSentence}
              disabled={!sentence.length}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                sentence.length
                  ? "bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10"
                  : "bg-white/5 text-zinc-700 cursor-not-allowed"
              }`}
              title="Clear all"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Celebration */}
        {celebrated && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur rounded-xl z-20 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="text-5xl mb-2 animate-bounce">🎉</div>
              <p className="text-lg font-black text-fuchsia-300">Amazing talking! +25 XP</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs + Symbol Grid */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <div className="flex flex-col gap-1.5 p-3 border-r border-white/5 bg-zinc-900/30 overflow-y-auto">
          {PICTO_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`flex flex-col items-center gap-1.5 w-16 py-3 rounded-2xl transition-all ${
                activeCategory.id === cat.id
                  ? `bg-gradient-to-br ${cat.color} text-white shadow-xl scale-105`
                  : "bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[9px] font-black uppercase tracking-wider leading-tight text-center">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 flex items-center gap-3">
            <div className={`h-px flex-1 bg-gradient-to-r ${activeCategory.color} opacity-30`} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">{activeCategory.label}</span>
            <div className={`h-px flex-1 bg-gradient-to-l ${activeCategory.color} opacity-30`} />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {activeCategory.items.map(item => (
              <button
                key={item.id}
                onClick={() => addSymbol(item)}
                disabled={sentence.length >= 8}
                className={`flex flex-col items-center gap-2 p-3 rounded-[20px] border transition-all group ${
                  sentence.length >= 8
                    ? "opacity-40 cursor-not-allowed bg-white/[0.02] border-white/5"
                    : `bg-white/[0.03] border-white/5 hover:bg-gradient-to-br hover:${activeCategory.color.replace("from-","from-").replace("to-","to-")} hover:border-white/20 hover:scale-110 active:scale-95 hover:shadow-2xl cursor-pointer`
                }`}
              >
                <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform">{item.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "👆", tip: "Tap a symbol to add it to your sentence" },
              { icon: "🔊", tip: "Press the speaker button to hear your words" },
              { icon: "✅", tip: "Press the green tick to share your sentence" },
              { icon: "↩️", tip: "Undo removes the last symbol you added" },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RealFeel Activity Component ──────────────────────────────────────────────

function RealFeelActivity({ activity, onComplete, onCancel }: { 
  activity: typeof ACTIVITIES[0], 
  onComplete: (xp: number) => void,
  onCancel: () => void 
}) {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p < 100) return p + 1;
        return 100;
      });
    }, (parseInt(activity.duration) * 60000) / 100 / 10); 
    return () => clearInterval(timer);
  }, [activity.duration]);

  const handleFinish = () => {
    setSuccess(true);
    setTimeout(() => onComplete(activity.xp), 1500);
  };

  const nextStep = () => {
    if (step < activity.steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${activity.gradient} opacity-20 blur-[120px] animate-pulse`} />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
        <div className="space-y-4">
          <div className="text-8xl animate-bounce">{activity.emoji}</div>
          <h2 className="text-4xl font-black tracking-tight">{activity.title}</h2>
          <p className="text-zinc-400 text-lg h-12 leading-relaxed">{activity.steps[step]}</p>
        </div>

        <div className="h-64 flex items-center justify-center w-full">
          {activity.options && activity.options.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              {activity.options.map((opt) => (
                <button 
                  key={opt}
                  onClick={nextStep}
                  className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-[1.03] active:scale-95 transition-all font-black text-xl shadow-xl hover:shadow-white/5"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div 
              className={`w-48 h-48 bg-gradient-to-br ${activity.gradient} rounded-full animate-pulse shadow-[0_0_80px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
              onClick={nextStep}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Pulse</span>
            </div>
          )}
        </div>

        <div className="space-y-4 w-full">
          <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest">
            <span>Progress Tracking</span>
            <span>{progress}%</span>
          </div>
          <div className="h-5 bg-zinc-900 rounded-full border border-white/10 overflow-hidden p-1">
            <div 
              className={`h-full bg-gradient-to-r ${activity.gradient} rounded-full transition-all duration-500 relative`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button onClick={onCancel} className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]">Exit Activity</button>
          <button 
            onClick={handleFinish} disabled={progress < 100 && step < activity.steps.length - 1}
            className={`flex-1 py-5 rounded-3xl font-black transition-all text-[11px] uppercase tracking-widest ${progress === 100 || success ? `bg-gradient-to-r ${activity.gradient} text-white shadow-2xl` : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
          >
            {success ? "WELL DONE! 🌟" : "COMPLETE NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Component ───────────────────────────────────────────────────────────

function ActiveChat({ friend, onClose }: { friend: any, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>(
    friend.isAI ? [
      { id: 1, text: `Hello there, wonderful friend! I'm Sage, your mentor. I'm here to help you stay calm, happy, and focused. How are you feeling today? 🌿`, sender: "them" },
    ] : [
      { id: 1, text: `Hey! I saw your new drawing in the feed. It looks amazing! 🎨`, sender: "them" },
      { id: 2, text: `Thank you, ${friend.name.split(' ')[0]}! I worked really hard on it.`, sender: "me" },
      { id: 3, text: `I can tell! We should do the Pattern Puzzler together later. 🧩`, sender: "them" },
    ]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (override?: string) => {
    const textToSend = override || input;
    if (!textToSend.trim() || loading) return;
    const userMsg = { id: Date.now(), text: textToSend, sender: "me" };
    setMessages(m => [...m, userMsg]);
    const sentInput = textToSend;
    setInput("");

    if (friend.isAI) {
      setLoading(true);
      try {
        const history = messages.map(m => ({ role: m.sender === "me" ? "user" : "assistant", content: m.text }));
        const res = await axios.post("/api/chat/mentor", { message: sentInput, history });
        setMessages(m => [...m, { id: Date.now()+1, text: res.data.text, sender: "them", options: res.data.options }]);
      } catch (err) {
        setMessages(m => [...m, { id: Date.now()+1, text: "Wait, I'm thinking too many thoughts at once! 🧩 Let's try again in a moment.", sender: "them" }]);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setMessages(m => [...m, { id: Date.now()+1, text: "That's so cool! Let's chat more in the garden. 🌿", sender: "them" }]);
      }, 1200);
    }
  };

  const SAGE_QUICK_PROMPTS = ["I'm feeling sad 😢", "Help me calm down 🌸", "I did something great! 🌟", "I'm bored 😴"];

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[580px] bg-zinc-900 border border-white/10 rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.9)] flex flex-col z-[50] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">

      {/* Header */}
      {friend.isAI ? (
        <div className="p-5 flex items-center gap-4 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 relative overflow-hidden border-b border-white/5 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.15),transparent_60%)]" />
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl z-10 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/20 relative shrink-0">
            🌿
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-zinc-900 animate-pulse" />
          </div>
          <div className="flex-1 z-10 min-w-0">
            <p className="text-sm font-black tracking-tight text-white">Sage</p>
            <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-[0.2em] mt-0.5">✦ AI Mentor · Always Here</p>
          </div>
          <button onClick={onClose} className="z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all text-white/60 hover:text-white shrink-0">✕</button>
        </div>
      ) : (
        <div className={`p-5 flex items-center gap-4 bg-gradient-to-r ${friend.gradient} relative overflow-hidden shadow-lg shrink-0`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="w-12 h-12 rounded-[20px] bg-black/20 flex items-center justify-center font-black text-lg z-10 border border-white/10 shrink-0">{friend.initials}</div>
          <div className="flex-1 z-10 min-w-0">
            <p className="text-sm font-black tracking-tight">{friend.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Online Now</p>
            </div>
          </div>
          <button onClick={onClose} className="z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all shrink-0">✕</button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar min-h-0">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col gap-2 ${m.sender === "me" ? "items-end" : "items-start"}`}>
            <div className={`flex items-end gap-2 ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              {m.sender !== "me" && friend.isAI && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shrink-0 mb-0.5 shadow-md">🌿</div>
              )}
              <div className={`max-w-[82%] px-4 py-3 rounded-[22px] text-[13px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                m.sender === "me"
                  ? "bg-white text-zinc-950 rounded-br-sm"
                  : friend.isAI
                    ? "bg-emerald-950/70 text-emerald-50 border border-emerald-500/20 rounded-bl-sm"
                    : "bg-white/5 text-zinc-100 border border-white/10 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
            {/* Dynamic Options from Backend */}
            {m.options && m.options.length > 0 && (
              <div className="flex gap-2 pl-9">
                {m.options.map((opt: string, i: number) => (
                  <button 
                    key={i} onClick={() => send(opt)} disabled={loading}
                    className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-900/60 transition-all shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shrink-0">🌿</div>
            <div className="bg-emerald-950/70 border border-emerald-500/20 px-5 py-4 rounded-[22px] rounded-bl-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts (Sage only) */}
      {friend.isAI && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {SAGE_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/70 backdrop-blur flex gap-3 shrink-0">
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder={friend.isAI ? "Tell Sage how you feel..." : "Say something nice..."}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all font-medium disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 shrink-0 ${
            friend.isAI
              ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-white text-zinc-950"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12L3.269 3.126A59.77 59.77 0 0121.485 12 59.772 59.772 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Drawing Tool ─────────────────────────────────────────────────────────────

function DrawingCanvas() {
  const { sharePost } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#818cf8");
  const [brushSize, setBrushSize] = useState(6);
  const [saved, setSaved] = useState(false);
  const [caption, setCaption] = useState("");

  const colors = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#38bdf8", "#a78bfa", "#ffffff"];

  const getPos = (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: any) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y); ctx.strokeStyle = color; ctx.lineWidth = brushSize; ctx.lineCap = "round"; ctx.stroke();
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const content = canvasRef.current.toDataURL();
    await sharePost({ type: "Drawing", content, caption });
    setSaved(true);
  };

  return (
    <div className="space-y-5 text-left">
      <div className="flex gap-2.5 flex-wrap">
        {colors.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full ${color === c ? "ring-2 ring-white scale-110 shadow-lg" : "hover:scale-105"} transition-all`} style={{ background: c }} />
        ))}
      </div>
      <canvas
        ref={canvasRef} width={800} height={400} 
        className="w-full h-64 bg-zinc-950 rounded-[32px] cursor-crosshair touch-none border border-white/10 shadow-inner"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => drawing.current = false}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => drawing.current = false}
      />
      <input 
        value={caption} onChange={(e) => setCaption(e.target.value)} 
        placeholder="Name your masterpiece..." className="w-full bg-white/5 px-5 py-4 rounded-2xl border border-white/10 text-[13px] font-medium outline-none focus:border-white/20 text-white placeholder-zinc-600 transition-all"
      />
      <button 
        onClick={handleShare} disabled={saved}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-purple-500/20"
      >
        {saved ? "SHARED SUCCESSFULLY! 🎨" : "SHARE DRAWING (+25 XP)"}
      </button>
    </div>
  );
}

// ── Audio Tool ─────────────────────────────────────────────────────────────

function AudioRecorder() {
  const { sharePost } = useAuth();
  const [recording, setRecording] = useState(false);
  const [recordedObj, setRecordedObj] = useState<{ blobUrl: string, seconds: number } | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setRecordedObj({ blobUrl: reader.result as string, seconds: chunksRef.current.length ? seconds || 1 : seconds });
        };
      };

      mediaRecorder.start();
      setRecording(true);
      setSeconds(0);
      setRecordedObj(null);
      
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const handleShare = async () => {
    if (!recordedObj) return;
    await sharePost({ type: "Audio", content: recordedObj.blobUrl, caption: `My ${recordedObj.seconds}s recording` });
    setRecordedObj(null);
    setSeconds(0);
  };

  return (
    <div className="space-y-8 text-center text-white py-4">
      <div className="text-7xl font-black tabular-nums tracking-tighter">{seconds}s</div>
      <div className="flex flex-col items-center gap-5">
        <button 
          onClick={toggleRecording}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${recording ? "bg-zinc-700 animate-pulse scale-110 shadow-[0_0_40px_rgba(255,255,255,0.1)]" : "bg-rose-500 shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95"}`}
        >
          {recording ? <div className="w-8 h-8 bg-white rounded-md" /> : <div className="w-10 h-10 bg-white rounded-full shadow-inner" />}
        </button>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">{recording ? "Listening carefully..." : "Tap To Speak"}</p>
      </div>
      {recordedObj && !recording && (
        <div className="space-y-4 max-w-sm mx-auto">
          <audio src={recordedObj.blobUrl} className="w-full h-12" controls />
          <button onClick={handleShare} className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02]">
            SHARE RECORDING 🎙️ (+25 XP)
          </button>
        </div>
      )}
    </div>
  );
}

// ── Story Tool ─────────────────────────────────────────────────────────────

function StoryWriter() {
  const { sharePost } = useAuth();
  const [text, setText] = useState("");
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    await sharePost({ type: "Story", content: text });
    setShared(true);
  };

  return (
    <div className="space-y-5 text-left text-white">
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={6}
        placeholder="Once upon a time in a world of superpowers..."
        className="w-full rounded-[32px] bg-zinc-950 border border-white/10 p-7 text-[15px] leading-relaxed resize-none outline-none focus:border-blue-500/40 transition-all font-sans"
      />
      <button 
        onClick={handleShare} disabled={!text.trim() || shared}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
      >
        {shared ? "STORY SHARED! 📖" : "SHARE STORY (+25 XP)"}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const ACTIVITY_CATEGORIES = ["All", "Mindfulness", "Social Skills", "Cognitive", "Communication", "Creative"];
const FRIENDS = [
  { id: "f0", name: "Sage (AI Mentor)", initials: "🌿", gradient: "from-emerald-500 to-teal-600", age: "AI", status: "Here to guide you, friend!", isAI: true },
  { id: "f1", name: "Aryan K.", initials: "AK", gradient: "from-blue-400 to-cyan-400", age: 9, status: "Playing Pattern Puzzler" },
  { id: "f2", name: "Meera S.", initials: "MS", gradient: "from-rose-400 to-pink-400", age: 11, status: "Just shared a drawing! 😍" },
  { id: "f4", name: "Riya M.", initials: "RM", gradient: "from-amber-400 to-orange-400", age: 10, status: "Taking a deep breath..." },
  { id: "f5", name: "Ishan T.", initials: "IT", gradient: "from-purple-400 to-pink-400", age: 12, status: "Writing a new story! 📖" },
  { id: "f6", name: "Kavi V.", initials: "KV", gradient: "from-emerald-400 to-teal-400", age: 9, status: "Feeling super productive!" },
];

export default function CommunityPage() {
  const { user, sharePost, completeActivity } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [activityCategory, setActivityCategory] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeActivity, setActiveActivity] = useState<typeof ACTIVITIES[0] | null>(null);
  const [activePictogram, setActivePictogram] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "mine">("all");
  const [createTab, setCreateTab] = useState<"drawing" | "audio" | "story">("drawing");
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, { id: string, author: string, text: string }[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const submitComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: user?.firstName || "Me",
      text: text.trim()
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setCommentInputs(prev => ({
      ...prev,
      [postId]: ""
    }));
  };

  const toggleCommentsView = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/community/posts");
        setPosts(res.data);
      } catch (err) { console.error("Failed to fetch posts:", err); }
    };
    if (activeTab === "feed") fetchPosts();
  }, [activeTab]);

  const allPosts = [...posts, ...MOCK_POSTS].sort((a,b) => b.id.localeCompare(a.id));

  const filteredPosts = feedFilter === "mine" 
    ? allPosts.filter(p => p.author?.avatarInitials === user?.avatarInitials)
    : allPosts;

  if (activePictogram) {
    return (
      <PictogramActivity
        onCancel={() => setActivePictogram(false)}
        onComplete={async (xp) => {
          await completeActivity("act-picto", xp);
          setActivePictogram(false);
        }}
      />
    );
  }

  if (activeActivity) {
    return (
      <RealFeelActivity 
        activity={activeActivity}
        onCancel={() => setActiveActivity(null)}
        onComplete={async (xp) => {
          await completeActivity(activeActivity.id, xp);
          setActiveActivity(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-white selection:text-zinc-950">
      <header className="relative z-20 sticky top-0 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center text-zinc-950 font-black text-sm shadow-xl shadow-white/5 transition-transform hover:scale-105 active:scale-95">U</div>
          <span className="text-2xl font-black tracking-tighter">uniquely.us</span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-1.5 scale-90">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Mastery Level {user?.level ?? 1}</div>
            <div className="flex items-center gap-3">
              <span className="text-white text-base font-black tracking-[0.1em]">{user?.xp ?? 0}<span className="text-zinc-600">/100</span></span>
              <div className="w-28 h-2.5 bg-white/5 rounded-full border border-white/5 overflow-hidden p-0.5">
                <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_white]" style={{ width: `${(user?.xp ?? 0) % 100}%` }} />
              </div>
            </div>
          </div>
          <Link href="/next-steps" className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] hover:bg-white/10 transition-all uppercase shadow-sm">← Exit Garden</Link>
        </div>
      </header>

      <div className="relative z-10 sticky top-[73px] px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl flex gap-3 overflow-x-auto no-scrollbar">
        {(["feed", "activities", "create", "friends"] as TabType[]).map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-7 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === tab ? "bg-white text-zinc-950 shadow-2xl scale-105" : "bg-white/5 text-zinc-500 border border-white/5 hover:text-zinc-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {activeTab === "feed" && (
          <div className="space-y-10 text-left">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tighter">Community Garden 🍃</h1>
                <p className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                   <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   {allPosts.length} minds growing together
                </p>
              </div>
              <div className="flex gap-2 p-2 bg-white/5 rounded-[20px] border border-white/10 scale-90 origin-right transition-all">
                <button onClick={() => setFeedFilter("all")} className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all ${feedFilter === "all" ? "bg-white text-zinc-950 shadow-xl" : "text-zinc-500 hover:text-white"}`}>GLOBAL</button>
                <button onClick={() => setFeedFilter("mine")} className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all ${feedFilter === "mine" ? "bg-white text-zinc-950 shadow-xl" : "text-zinc-500 hover:text-white"}`}>PERSONAL</button>
              </div>
            </div>
            
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="rounded-[48px] border border-white/5 bg-white/[0.03] p-10 space-y-8 hover:border-white/10 transition-all group relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/[0.02] to-transparent blur-[100px] pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-[24px] bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-base text-white shadow-2xl group-hover:scale-110 transition-transform`}>
                        {post.author?.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-4">
                          <p className="font-black text-xl tracking-tight">{post.author?.firstName} {post.author?.lastName[0]}.</p>
                          <span className="text-[11px] font-black text-white/40 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                            {POST_TYPE_ICONS[post.type]} {post.type}
                          </span>
                        </div>
                        <p className="text-[12px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-1">{post.date}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all text-2xl group-hover:scale-110 ${likedPosts[post.id] ? "text-rose-500 bg-rose-500/10" : "text-zinc-600 hover:text-rose-500 hover:bg-rose-500/5"}`}
                    >
                      {likedPosts[post.id] ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="pl-[84px]">
                    <p className="text-xl text-zinc-100 leading-relaxed font-semibold">"{post.content.startsWith('data:image') ? post.caption || 'My new drawing!' : post.content}"</p>
                    
                    {post.type === "Drawing" && post.content.startsWith('data:image') && (
                      <div className="mt-8 w-full rounded-[32px] overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-zinc-950/50 group-hover:border-white/20 transition-all">
                        <img 
                          src={post.content} 
                          alt="User Drawing" 
                          className="w-full h-auto max-h-[500px] object-contain bg-zinc-900/10" 
                        />
                      </div>
                    )}

                    {post.type === "Drawing" && post.id.startsWith("m") && (
                      <div className="mt-8 w-full h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-[32px] border border-white/10 flex flex-col items-center justify-center gap-4 group-hover:from-purple-500/10 transition-all">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-500/30 flex items-center justify-center text-3xl opacity-50">🎨</div>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-400 opacity-60">Curating Masterpiece...</p>
                      </div>
                    )}

                    {post.type === "Audio" && (
                      <div className="mt-8 p-6 rounded-[32px] bg-white/[0.04] border border-white/10 flex items-center gap-6 group/audio shadow-inner hover:bg-white/[0.06] transition-all">
                        <div className="w-16 h-16 rounded-3xl bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/30 text-white shrink-0">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] mb-3">
                            <span className="truncate">{post.caption || "A New Thought Shared"}</span>
                          </div>
                          {post.content.startsWith("data:audio") || post.content.startsWith("blob:") ? (
                            <audio src={post.content} controls className="w-full h-10 outline-none" />
                          ) : (
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <div className="h-full w-1/4 bg-rose-500 rounded-full group-hover/audio:w-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-10 flex gap-10 text-[12px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-3 hover:text-white cursor-pointer transition-colors ${likedPosts[post.id] ? "text-rose-400" : "text-zinc-500"}`}
                      >
                        ❤️ {post.likes + (likedPosts[post.id] ? 1 : 0)} ENDORSEMENTS
                      </button>
                      <button 
                        onClick={() => toggleCommentsView(post.id)}
                        className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors text-zinc-500"
                      >
                        💬 {(postComments[post.id]?.length || 0)} RESPONSES
                      </button>
                    </div>

                    {showComments[post.id] && (
                      <div className="mt-8 space-y-6 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                        <div className="space-y-4">
                          {(postComments[post.id] || []).map(comment => (
                            <div key={comment.id} className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black">{comment.author[0]}</div>
                              <div className="flex-1 bg-white/[0.03] rounded-2xl px-5 py-3 border border-white/5">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{comment.author}</p>
                                <p className="text-sm text-zinc-300 font-medium">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-3">
                          <input 
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                            placeholder="Add a kind response..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all"
                          />
                          <button 
                            onClick={() => submitComment(post.id)}
                            className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-zinc-950 font-black hover:scale-105 active:scale-95 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activityCategory === "All" || activityCategory !== "" ? (
          activeTab === "activities" && (
            <div className="space-y-12 text-left">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Growth Center 🎮</h1>
                <p className="text-zinc-500 font-semibold mt-3 text-lg">Specialized modules designed for unique superpowers</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {ACTIVITY_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActivityCategory(cat)} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all tracking-[0.2em] shadow-sm uppercase ${activityCategory === cat ? "bg-white text-zinc-950 shadow-2xl scale-105" : "bg-white/5 text-zinc-500 hover:text-zinc-200"}`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {ACTIVITIES.filter(a => activityCategory === "All" || a.category === activityCategory).map(act => (
                  <div key={act.id} className="group rounded-[48px] border border-white/5 bg-white/[0.03] overflow-hidden hover:scale-[1.03] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl">
                    <div className={`h-40 bg-gradient-to-br ${act.gradient} flex items-center justify-center text-7xl relative overflow-hidden transition-all group-hover:h-44`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10 drop-shadow-2xl">{act.emoji}</span>
                    </div>
                    <div className="p-10 space-y-8 text-left">
                      <div className="space-y-3">
                         <h3 className="font-black text-2xl tracking-tight">{act.title}</h3>
                         <p className="text-[15px] text-zinc-500 font-medium leading-relaxed line-clamp-2">{act.desc}</p>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] pt-6 border-t border-white/5">
                        <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{act.duration}</span>
                        <span className="text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">+{act.xp} XP BONUS</span>
                      </div>
                      <button
                        onClick={() => act.isPictogram ? setActivePictogram(true) : setActiveActivity(act)}
                        className={`w-full py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none ${
                          act.isPictogram
                            ? "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white shadow-fuchsia-500/30"
                            : "bg-white text-zinc-950"
                        }`}
                      >
                        {act.isPictogram ? "Open AAC Board 🗣️" : "Start Training →"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : null}

        {activeTab === "create" && (
          <div className="max-w-3xl mx-auto space-y-12 text-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Expression Studio ✨</h1>
              <p className="text-zinc-500 font-semibold mt-3 text-lg">Your art is your frequency—show us how you see the world!</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {(["drawing", "audio", "story"] as const).map(t => (
                <button key={t} onClick={() => setCreateTab(t)} className={`p-10 rounded-[48px] border-2 transition-all flex flex-col items-center gap-6 ${createTab === t ? "bg-white text-zinc-950 border-white shadow-[0_32px_64px_rgba(255,255,255,0.1)] -translate-y-3" : "bg-white/[0.03] text-zinc-600 border-white/5 hover:border-white/20 active:scale-95"}`}>
                  <div className="text-6xl drop-shadow-lg">{{drawing: "🎨", audio: "🎙️", story: "📖"}[t]}</div>
                  <div className="text-[13px] font-black uppercase tracking-[0.3em]">{t}</div>
                </button>
              ))}
            </div>
            <div className="rounded-[56px] border border-white/10 bg-white/[0.03] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 blur-[80px] pointer-events-none" />
              {createTab === "drawing" && <DrawingCanvas />}
              {createTab === "audio" && <AudioRecorder />}
              {createTab === "story" && <StoryWriter />}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-left tracking-tight">Peer Connection 👫</h1>
                <p className="text-zinc-500 font-semibold mt-3 text-left text-lg">Safely connect with a mentor or peer to support your growth</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full shadow-inner">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
                 <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Guardian Watch Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FRIENDS.map(f => (
                <div key={f.id} className="rounded-[40px] border border-white/5 bg-white/[0.03] p-8 flex items-center gap-6 hover:bg-white/[0.08] hover:border-white/10 transition-all group cursor-pointer hover:-translate-y-2 shadow-sm hover:shadow-2xl">
                  <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${f.gradient} flex items-center justify-center font-black text-2xl text-white shadow-2xl group-hover:scale-110 transition-transform relative`}>
                    {f.isAI && <div className="absolute -top-3 -right-3 px-3 py-1 bg-white text-zinc-950 text-[9px] font-black rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.3)] border-2 border-zinc-950 uppercase tracking-widest">Mentor</div>}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full border-[6px] border-zinc-950 scale-0 group-hover:scale-100 transition-transform shadow-lg" />
                    {f.initials}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-black text-lg tracking-tight truncate group-hover:text-white transition-colors">{f.name}</p>
                    <div className="flex items-center gap-2.5 mt-1">
                       <span className={`w-2 h-2 rounded-full ${f.isAI ? 'bg-blue-400 shadow-[0_0_8px_cyan]' : 'bg-green-500 shadow-[0_0_8px_green]'}`} />
                       <p className={`text-[12px] font-black ${f.isAI ? 'text-blue-400' : 'text-green-500'} uppercase tracking-tight`}>{f.isAI ? 'AI Brain Active' : 'Active Now'}</p>
                    </div>
                    <p className="text-[13px] text-zinc-500 font-medium truncate italic mt-2 tracking-tight group-hover:text-zinc-300 transition-colors leading-relaxed">"{f.status}"</p>
                  </div>
                  <button 
                    onClick={() => setActiveChatFriend(f)}
                    className={`w-14 h-14 ${f.isAI ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-white'} rounded-[22px] hover:scale-110 active:scale-90 transition-all font-bold flex items-center justify-center shadow-2xl border-white/10`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {activeChatFriend && <ActiveChat friend={activeChatFriend} onClose={() => setActiveChatFriend(null)} />}

      <footer className="py-24 text-center opacity-40">
        <div className="flex items-center justify-center gap-12 mb-8">
           <div className="h-px w-20 bg-white/10" />
           <p className="text-[12px] font-black tracking-[0.6em] uppercase text-zinc-500">Uniquely Us · Mentorship Platform</p>
           <div className="h-px w-20 bg-white/10" />
        </div>
        <p className="text-[11px] font-bold text-zinc-600 tracking-[0.2em] uppercase max-w-lg mx-auto leading-relaxed">Pioneering a safe, expressive, and aligned future for every neurodiverse mind in our community · 2026</p>
      </footer>
    </div>
  );
}
