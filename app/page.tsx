"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black gap-4 text-center">
      <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-950 dark:border-zinc-800 dark:border-t-white rounded-full animate-spin" />
      <span className="text-zinc-500 font-bold tracking-widest uppercase text-xs animate-pulse">Routing gracefully...</span>
    </div>
  );
}
