"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black text-black dark:text-zinc-50">
      <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Uniquely Us</h1>
        <nav className="flex gap-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-400">
            {isLoggedIn ? "Dashboard" : "Log In"}
          </Link>
          {!isLoggedIn && (
            <Link href="/login" className="text-sm font-bold bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-4 py-1.5 rounded-full hover:opacity-90">
              Sign Up
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Empowering Neurodiversity Through Detection & Support
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A comprehensive platform for autism spectrum disorder detection, reports, and personalized support paths.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link 
              href={isLoggedIn ? "/test" : "/login"}
              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Take ASD Test
            </Link>
            <Link 
              href={isLoggedIn ? "/upload-report" : "/login"}
              className="px-8 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm"
            >
              Upload Existing Report
            </Link>
          </div>

          <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Our Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  🧠
                </div>
                <h4 className="font-bold mb-2">AI-Powered Detection</h4>
                <p className="text-sm text-zinc-500">Multiple specialized models for accurate initial screening.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  📊
                </div>
                <h4 className="font-bold mb-2">Detailed Dashboard</h4>
                <p className="text-sm text-zinc-500">Track progress and access comprehensive reporting after login.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  🌱
                </div>
                <h4 className="font-bold mb-2">Support Paths</h4>
                <p className="text-sm text-zinc-500">Personalized resources and next steps for neurodivergent individuals.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
        © 2024 Uniquely Us. All rights reserved.
      </footer>
    </div>
  );
}
