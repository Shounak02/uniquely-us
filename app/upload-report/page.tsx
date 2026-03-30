"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function UploadReportPage() {
  const { addReport, isLoggedIn } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setIsUploading(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 30;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Save to DB if logged in
        if (isLoggedIn) {
          addReport({
            fileName: "Clinical_ASD_Assessment.pdf",
            uploadedDate: new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            }),
            type: "Clinical Assessment",
            status: "Analyzed",
          });
        }

        setTimeout(() => {
          router.push("/next-steps");
        }, 800);
      }
      setProgress(currentProgress);
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50 font-sans transition-colors duration-500">
      {/* Ambient background accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[100px]" />
      </div>

      <header className="relative z-10 px-6 py-5 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm group-hover:rotate-6 transition-transform">U</div>
          <span className="text-xl font-black tracking-tighter">Uniquely Us</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors">Dashboard</Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto p-6 py-16 flex flex-col justify-center">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black uppercase tracking-widest text-zinc-500">
              Skip the screening
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Upload Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Clinical Report
              </span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-lg leading-relaxed">
              Have an existing assessment? Skip our questionnaire and get immediate access to your personalized care journey.
            </p>
          </div>

          {!isUploading ? (
            <div 
              onClick={handleUpload}
              className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center space-y-8 text-center hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.01] hover:bg-zinc-50 dark:hover:bg-zinc-900 group"
            >
              <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center text-4xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/20">
                📄
              </div>
              <div className="space-y-2">
                <p className="font-black text-2xl mb-1">Upload Result</p>
                <p className="text-zinc-500 dark:text-zinc-400">PDF, PNG or JPG files accepted (max 10MB)</p>
              </div>
              <button className="px-10 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black text-lg shadow-2xl hover:opacity-90 transition-all active:scale-95">
                Select File
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-16 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center space-y-8 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-blue-500/10 dark:bg-blue-400/10 rounded-3xl flex items-center justify-center text-4xl animate-pulse">
                📤
              </div>
              <div className="w-full max-w-md space-y-4">
                <div className="flex justify-between items-end">
                  <p className="font-black text-xl">Uploading Report...</p>
                  <p className="font-black text-blue-600 dark:text-blue-400 tabular-nums">{Math.round(progress)}%</p>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Encrypting and analyzing clinical data. Please wait.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-xl flex-shrink-0">🔒</div>
                <div>
                  <h4 className="font-black text-blue-900 dark:text-blue-300 text-sm mb-1 uppercase tracking-tight">Privacy Shield</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">Your reports are end-to-end encrypted and analyzed by HIPAA-compliant models.</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">⚡</div>
                <div>
                  <h4 className="font-black text-zinc-900 dark:text-zinc-300 text-sm mb-1 uppercase tracking-tight">Skips Screening</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Instantly unlocks specialists and the community platform upon successful upload.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Link 
              href="/dashboard"
              className="text-sm font-black text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors border-b-2 border-transparent hover:border-current pb-0.5"
            >
              Skip for now and browse dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-xs text-zinc-400 font-medium tracking-wide uppercase">
        © 2026 Uniquely Us · Secure Health Data Infrastructure
      </footer>
    </div>
  );
}
