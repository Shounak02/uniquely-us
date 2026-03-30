"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!email || !password) {
        setError("Please fill in all required fields.");
        return;
      }
    } else {
      if (!firstName || !lastName || !email || !password) {
        setError("Please fill in all required fields.");
        return;
      }
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register({ firstName, lastName, email, password });
    }

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black font-sans text-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Left Section: Branding */}
      <div className="relative hidden md:flex flex-1 flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] animate-pulse delay-300"></div>

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg">U</div>
          <span className="text-2xl font-black tracking-tighter italic">UNIQUELY US</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-white/80">
            Neurodiversity Redefined
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            See the world <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">differently.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-md leading-relaxed">
            Joining our community means moving beyond diagnosis toward a world of potential, support, and profound understanding.
          </p>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10">
          <div className="flex gap-12 items-center">
            <div>
              <div className="text-3xl font-black">98%</div>
              <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-black">15k+</div>
              <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-black">ASD</div>
              <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Specialist Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 lg:p-24 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl md:hidden"></div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-black text-sm">U</div>
            <span className="text-lg font-black tracking-tighter italic">UNIQUELY US</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight">
              {isLogin ? "Welcome back." : "Create your account."}
            </h2>
            <p className="text-zinc-500 font-medium">
              {isLogin
                ? "Enter your credentials to access your personal dashboard."
                : "Join the platform that understands you best."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-1 uppercase tracking-wider text-zinc-500" htmlFor="fname">First Name</label>
                  <input
                    id="fname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-50 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-900/50 transition-all outline-none"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-1 uppercase tracking-wider text-zinc-500" htmlFor="lname">Last Name</label>
                  <input
                    id="lname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-50 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-900/50 transition-all outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold ml-1 uppercase tracking-wider text-zinc-500" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-50 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-900/50 transition-all outline-none"
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold ml-1 uppercase tracking-wider text-zinc-500" htmlFor="password">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Forgot password?</button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-50 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-900/50 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center p-4 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing you in...
                </span>
              ) : (
                <>
                  <span className="relative z-10">{isLogin ? "Sign In" : "Create Account"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white dark:bg-black px-4 text-zinc-400">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setError("Google login is not enabled in this learning environment. Please use the email form.")} className="flex items-center justify-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button type="button" onClick={() => setError("Apple login is not enabled in this learning environment. Please use the email form.")} className="flex items-center justify-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.05 20.28c-.96.95-2.06 1.9-3.37 1.9-1.27 0-1.7-.77-3.23-.77-1.54 0-2.01.74-3.27.77-1.31.03-2.41-.95-3.37-1.9-1.97-2.84-3.48-8.05-1.44-11.58 1.01-1.75 2.81-2.85 4.77-2.88 1.48-.03 2.89 1 3.8 1 .9 0 2.62-1.25 4.39-1.07 1.01.04 2.81.4 4.01 2.14-.1.06-2.4 1.4-2.4 4.22 0 3.39 2.97 4.58 3.02 4.6-.03.09-.47 1.62-1.52 3.16M12.03 5.43c.48-2.42 2.41-4.3 4.83-4.3.2 0 .42.01.6.03-.12 2.47-2.03 4.49-4.51 4.49-.24 0-.6-.04-.92-.22" />
              </svg>
              Apple
            </button>
          </div>

          {/* Toggle */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-sm font-black tracking-tight uppercase hover:opacity-70 transition-opacity"
            >
              {isLogin
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-8 flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Help</a>
        </div>
      </div>
    </div>
  );
}
