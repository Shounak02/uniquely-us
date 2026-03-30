"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

export type TestResult = {
  id: string;
  modelName: string;
  date: string;
  score: number; // 0-100
  risk: "Low" | "Moderate" | "High" | string;
  summary: string;
  rawInputs?: any;
};

export type UploadedReport = {
  id: string;
  fileName: string;
  uploadedDate: string;
  type: string;
  status: "Analyzed" | "Pending Review" | string;
};

export type CommunityPost = {
  id: string;
  type: "Drawing" | "Story" | "Audio" | string;
  content: string;
  caption?: string;
  likes: number;
  date: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedDate: string;
  avatarInitials: string;
  testHistory: TestResult[];
  uploadedReports: UploadedReport[];
  posts: CommunityPost[];
  xp: number;
  level: number;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoggedIn: boolean;
  addTestResult: (result: Omit<TestResult, "id">) => Promise<void>;
  addReport: (report: Omit<UploadedReport, "id">) => Promise<void>;
  sharePost: (post: Omit<CommunityPost, "id" | "likes" | "date">) => Promise<void>;
  completeActivity: (activityId: string, xpGain: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  isLoggedIn: false,
  addTestResult: async () => {},
  addReport: async () => {},
  sharePost: async () => {},
  completeActivity: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistence: Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("uniquely-us-user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure arrays exist to prevent crashes
      parsed.testHistory = parsed.testHistory || [];
      parsed.uploadedReports = parsed.uploadedReports || [];
      parsed.posts = parsed.posts || [];
      parsed.xp = parsed.xp ?? 50;
      parsed.level = parsed.level ?? 1;
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setUser(res.data);
      localStorage.setItem("uniquely-us-user", JSON.stringify(res.data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Login failed" };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await axios.post("/api/auth/register", userData);
      setUser(res.data);
      localStorage.setItem("uniquely-us-user", JSON.stringify(res.data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("uniquely-us-user");
  };

  const addTestResult = async (result: Omit<TestResult, "id">) => {
    if (!user) return;
    try {
      const res = await axios.post("/api/tests/add", { ...result, userId: user.id });
      const newTest = res.data;
      const updatedUser = {
        ...user,
        testHistory: [newTest, ...user.testHistory],
      };
      setUser(updatedUser);
      localStorage.setItem("uniquely-us-user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to add test result:", err);
    }
  };

  const addReport = async (report: Omit<UploadedReport, "id">) => {
    if (!user) return;
    try {
      const res = await axios.post("/api/reports/add", { ...report, userId: user.id });
      const newReport = res.data;
      const updatedUser = {
        ...user,
        uploadedReports: [newReport, ...user.uploadedReports],
      };
      setUser(updatedUser);
      localStorage.setItem("uniquely-us-user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to add report:", err);
    }
  };

  const sharePost = async (post: Omit<CommunityPost, "id" | "likes" | "date">) => {
    if (!user) return;
    try {
      const res = await axios.post("/api/community/share", { ...post, authorId: user.id });
      const newPost = res.data;
      const updatedUser = {
        ...user,
        posts: [newPost, ...user.posts],
        xp: user.xp + 25 // Share bonus
      };
      setUser(updatedUser);
      localStorage.setItem("uniquely-us-user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to share post:", err);
    }
  };

  const completeActivity = async (activityId: string, xpGain: number) => {
    if (!user) return;
    try {
      const res = await axios.post("/api/activities/complete", { activityId, xpGain, userId: user.id });
      const { updatedUser: backendUser } = res.data;
      
      const updatedUser = {
        ...user,
        xp: backendUser.xp,
        level: backendUser.level
      };
      setUser(updatedUser);
      localStorage.setItem("uniquely-us-user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to complete activity:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoggedIn: !!user, 
      addTestResult, 
      addReport,
      sharePost,
      completeActivity
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
