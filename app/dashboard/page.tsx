"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { QUESTIONS, SCALE } from "../components/TestQuestionnaire";
import axios from "axios";

const ASD_NEWS = [
  {
    id: 1,
    category: "Research",
    categoryColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    title: "Breakthrough: AI Identifies Early ASD Markers in Toddlers with 94% Accuracy",
    source: "Nature Neuroscience",
    date: "Mar 19, 2026",
    readTime: "4 min read",
    summary: "Researchers at MIT developed a deep learning model that analyzes gaze patterns and motor responses in children aged 18–36 months, significantly improving early detection rates.",
  },
  {
    id: 2,
    category: "Therapy",
    categoryColor: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    title: "Music Therapy Shows Significant Improvement in Social Communication for ASD Adolescents",
    source: "Journal of Autism & Developmental Disorders",
    date: "Mar 15, 2026",
    readTime: "3 min read",
    summary: "A 12-month longitudinal study found that structured music therapy sessions improved social reciprocity scores by 27% in adolescents on the autism spectrum.",
  },
  {
    id: 3,
    category: "Support",
    categoryColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    title: "New Government Initiative Expands ASD Support Services Across 15 States",
    source: "HealthPolicy Today",
    date: "Mar 12, 2026",
    readTime: "2 min read",
    summary: "Federal funding of $2.3B allocated to expand occupational therapy, speech support, and educational resources for neurodivergent individuals across underserved regions.",
  },
  {
    id: 4,
    category: "Science",
    categoryColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    title: "Gut-Brain Axis Research Reveals New Links Between Microbiome and ASD Symptoms",
    source: "Cell Reports",
    date: "Mar 8, 2026",
    readTime: "5 min read",
    summary: "Landmark study identifies specific gut bacteria strains that correlate with reduced sensory processing difficulties in individuals diagnosed with autism spectrum disorder.",
  },
  {
    id: 5,
    category: "Technology",
    categoryColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    title: "VR Social Training Platform Reports 40% Improvement in Real-World Social Interactions",
    source: "Digital Health Journal",
    date: "Mar 5, 2026",
    readTime: "3 min read",
    summary: "A controlled trial using immersive VR environments to practice social scenarios demonstrated measurable improvements in communication and emotional recognition among ASD participants.",
  },
];

const RISK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Low: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  Moderate: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  High: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const REPORT_TYPE_ICONS: Record<string, string> = {
  "Clinical Assessment": "🏥",
  "Occupational Therapy": "🤝",
  "Speech Therapy": "🎙️",
  "Other": "📄",
};

export default function DashboardPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [parentModeUnlocked, setParentModeUnlocked] = useState(false);
  const [parentPasswordInput, setParentPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDFReport = async () => {
    if (!user) return;
    setIsGeneratingPDF(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString();

      // Header Styling
      doc.setFillColor(31, 31, 31); // Dark bg
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("UNIQUELY US: CLINICAL REPORT", 20, 25);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${timestamp}`, 160, 25);

      // Patient Info Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text("PATIENT INFORMATION", 20, 55);
      doc.line(20, 57, 190, 57);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient Name: ${user.firstName} ${user.lastName}`, 20, 65);
      doc.text(`Email: ${user.email}`, 20, 72);
      doc.text(`Member Since: ${user.joinedDate}`, 20, 79);
      doc.text(`Mastery Level: ${user.level} (${user.xp} XP)`, 20, 86);

      // Behavioral Metrics
      doc.setFont("helvetica", "bold");
      doc.text("BEHAVIORAL METRICS SUMMARY", 20, 105);
      doc.line(20, 107, 190, 107);
      
      doc.setFont("helvetica", "normal");
      doc.text("Word Category Usage:", 20, 115);
      doc.text("- Functional Needs: 45%", 30, 122);
      doc.text("- Emotional Feelings: 30%", 30, 129);
      doc.text("- Environmental Actions: 25%", 30, 136);

      doc.text("Activity Engagement:", 20, 146);
      doc.text("- Average Session Duration: 61 minutes", 30, 153);
      doc.text("- Engagement Trend: +24% increase this week", 30, 160);

      // Weekly Qualitative Summary
      doc.setFont("helvetica", "bold");
      doc.text("WEEKLY PROGRESS NOTES", 20, 180);
      doc.line(20, 182, 190, 182);

      doc.setFont("helvetica", "normal");
      doc.text("Social Progress: Increasing initiating speech. Responding 20% faster to AI Sage prompts.", 20, 190, { maxWidth: 170 });
      doc.text("Emotional Trends: Highest 'Calm' indicators recorded on Wednesday evenings.", 20, 203, { maxWidth: 170 });
      doc.text("Clinical Focus: Needs more variation in Action pictograms (currently mostly 'Go').", 20, 212, { maxWidth: 170 });

      // Recent Activity Log
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("DETAILED ACTIVITY LOG (LAST 30 ENTRIES)", 20, 20);
      doc.line(20, 22, 190, 22);

      let yPos = 35;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("DATE", 20, yPos);
      doc.text("TYPE", 50, yPos);
      doc.text("DESCRIPTION / RESULT", 90, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      doc.setFont("helvetica", "normal");

      // Merge and sort activities for the PDF
      const activities = [
        ...user.posts.map(p => ({ date: p.date, type: p.type, desc: p.content, isImage: p.type === 'Drawing' && p.content.startsWith('data:image') })),
        ...user.testHistory.map(t => ({ date: t.date, type: "Test", desc: `${t.modelName} (Score: ${t.score})`, isImage: false }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      activities.slice(0, 30).forEach((act) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(act.date, 20, yPos);
        doc.text(act.type, 50, yPos);
        
        if (act.isImage) {
          try {
            // Render actual drawing image in the PDF (x, y, w, h)
            doc.addImage(act.desc, 'PNG', 90, yPos - 3, 30, 20); 
            yPos += 25;
          } catch(e) {
            doc.text("[Drawing Image Attached]", 90, yPos);
            yPos += 5;
          }
        } else {
          // Normal text
          const descText = doc.splitTextToSize(act.desc, 100);
          doc.text(descText, 90, yPos);
          yPos += (descText.length * 5) + 3;
        }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footerY = 285;
      doc.text("CONFIDENTIAL CLINICAL DATA - UNIQUELY US PLATFORM (C) 2026", 105, footerY, { align: "center" });

      // Save PDF
      doc.save(`${user.firstName}_Clinical_Report_${timestamp.replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Something went wrong while generating the report. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadTestPDF = async (e: React.MouseEvent, test: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 64, 175);
      doc.text("Uniquely Us", 105, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Individual Assessment Report", 105, 30, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient: ${user?.firstName} ${user?.lastName}`, 20, 50);
      doc.text(`Date of Assessment: ${test.date}`, 20, 60);
      doc.text(`Assessment Tool: ${test.modelName}`, 20, 70);

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 75, 190, 75);

      doc.setFont("helvetica", "bold");
      doc.text("Diagnostic Metrics:", 20, 90);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Calculated Score: ${test.score} / 100`, 30, 100);
      doc.text(`Risk Indicator: ${test.risk}`, 30, 110);
      
      doc.setFont("helvetica", "bold");
      doc.text("Clinical Summary:", 20, 130);
      
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(test.summary, 160);
      doc.text(splitText, 30, 140);

      let currentY = 140 + (splitText.length * 7) + 10;

      if (test.rawInputs) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("User Inputs & Answers:", 20, currentY);
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        if (test.rawInputs.answers) {
           Object.entries(test.rawInputs.answers).forEach(([qId, sValue]) => {
              if (currentY > 270) {
                 doc.addPage();
                 currentY = 20;
              }
              const questionObj = QUESTIONS.find(q => q.id === qId);
              const scaleObj = SCALE.find(s => s.value === sValue);
              
              const qText = questionObj ? questionObj.text : qId;
              const aText = scaleObj ? scaleObj.label : String(sValue);
              
              const wrappedQ = doc.splitTextToSize(`Q: ${qText}`, 160);
              doc.text(wrappedQ, 25, currentY);
              currentY += (wrappedQ.length * 5);
              
              doc.setTextColor(30, 64, 175);
              doc.text(`A: ${aText} (${sValue}/5)`, 30, currentY);
              doc.setTextColor(0, 0, 0);
              currentY += 8;
           });
        } else if (test.rawInputs.scores) {
           Object.entries(test.rawInputs.scores).forEach(([key, val]) => {
             if (key !== "imageFile") {
               doc.text(`- ${key}: ${val}`, 30, currentY);
               currentY += 6;
             }
           });
        }
      }
      
      const footerY = currentY > 270 ? 280 : 280;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("CONFIDENTIAL CLINICAL DATA - UNIQUELY US PLATFORM", 105, footerY, { align: "center" });

      doc.save(`${test.modelName.replace(/\s+/g, '_')}_${test.date.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("Failed to generate test PDF", err);
      alert("Could not generate PDF right now.");
    }
  };

  const handleUnlockAnalytics = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentPasswordInput === "parent123") { // Mock parent password
      setParentModeUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setParentModeUnlocked(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-950 dark:border-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const latestTest = user.testHistory?.[0] ?? null;
  const totalTests = user.testHistory?.length ?? 0;
  const totalReports = user.uploadedReports?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm">U</div>
            <span className="text-lg font-black tracking-tighter hidden sm:block">Uniquely Us</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            <Link href="/test" className="px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Start Assessment</Link>
            <Link href="/upload-report" className="px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Analyze Document</Link>
            <Link href="/community" className="px-3 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 rounded-lg transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Community
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
              {user.avatarInitials}
            </div>
            <span className="text-sm font-bold">{user.firstName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 dark:from-zinc-900 dark:via-zinc-800 dark:to-blue-900 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-1">Welcome back</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Hello, {user.firstName} 👋
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">Member since {user.joinedDate} · {user.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black">{totalTests}</div>
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tests</div>
                </div>
                <div className="w-px bg-white/10 self-stretch"></div>
                <div className="text-center">
                  <div className="text-3xl font-black">{totalReports}</div>
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Reports</div>
                </div>
                {latestTest && (
                  <>
                    <div className="w-px bg-white/10 self-stretch"></div>
                    <div className="text-center">
                      <div className="text-3xl font-black">{latestTest.risk}</div>
                      <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Latest Risk</div>
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 group"
              >
                <span className="text-lg">🌱</span>
                <span>Community Garden</span>
                <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Tests + Reports */}
          <div className="xl:col-span-2 space-y-8">
            {/* Test History */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Your Test History</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">All {totalTests} assessments you have taken</p>
                </div>
                <Link
                  href="/test"
                  className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Test
                </Link>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {totalTests === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl">🧪</div>
                    <p className="font-bold text-zinc-500">No tests taken yet</p>
                    <p className="text-sm text-zinc-400 max-w-xs">Complete an assessment and save it to see your history here.</p>
                  </div>
                ) : (
                  user.testHistory?.map((test, index) => {
                    const colors = RISK_COLORS[test.risk];
                    return (
                      <Link
                        key={test.id}
                        href="/next-steps"
                        className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all border-b border-zinc-100 dark:border-zinc-800 last:border-0 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center font-black text-zinc-500 text-sm group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                            #{totalTests - index}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{test.modelName}</h3>
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                                {test.risk} Risk
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium mb-2">{test.date}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{test.summary}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 group-hover:border-blue-500/30 transition-all">
                              <span className="text-2xl font-black">{test.score}</span>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Score</span>
                            </div>
                            <button 
                              onClick={(e) => downloadTestPDF(e, test)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-all uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              PDF
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            {/* Uploaded Reports */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Uploaded Reports</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">{totalReports} clinical documents on file</p>
                </div>
                <Link
                  href="/upload-report"
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload
                </Link>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {user.uploadedReports?.map((report) => (
                  <Link
                    key={report.id}
                    href="/next-steps"
                    className="flex items-center gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {REPORT_TYPE_ICONS[report.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.fileName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-zinc-400">{report.uploadedDate}</span>
                        <span className="text-zinc-200 dark:text-zinc-700">·</span>
                        <span className="text-xs font-medium text-zinc-500">{report.type}</span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${report.status === "Analyzed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                      {report.status}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Analytics & Reporting */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative min-h-[400px] flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Analytics & Reporting
                    {!parentModeUnlocked && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">Locked</span>}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Parent-only behavioral progress and activity logs</p>
                </div>
                {parentModeUnlocked && (
                  <button
                    onClick={() => setParentModeUnlocked(false)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Lock Mode
                  </button>
                )}
              </div>
              
              <div className="flex-1 relative">
                {!parentModeUnlocked ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-8 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md">
                    <div className="max-w-sm w-full bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-6">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">🔒</div>
                      <div className="space-y-2">
                        <h3 className="font-black text-lg">Parental Access Required</h3>
                        <p className="text-xs text-zinc-500 font-medium">Please enter your profile password to view detailed behavioral analytics and activity reports.</p>
                      </div>
                      <form onSubmit={handleUnlockAnalytics} className="space-y-4">
                        <input 
                          type="password"
                          value={parentPasswordInput}
                          onChange={(e) => setParentPasswordInput(e.target.value)}
                          placeholder="Profile Password"
                          className={`w-full bg-zinc-50 dark:bg-zinc-800 border ${passwordError ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-700'} rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none transition-all shadow-sm`}
                        />
                        {passwordError && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest -mt-2">Incorrect Password — Try 'parent123'</p>}
                        <button 
                          type="submit"
                          className="w-full py-4 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          Unlock Analytics
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-8 relative z-10 animate-in fade-in duration-700">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* AAC Communication Analytics */}
                      <div className="border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 hover:border-purple-200 dark:hover:border-purple-800 transition-colors shadow-sm">
                          <h3 className="text-sm font-black mb-4 flex items-center gap-2">🗣️ Word Category Usage</h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-blue-600 dark:text-blue-400">Needs (Functional)</span>
                                <span>45%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-amber-600 dark:text-amber-400">Feelings (Emotional)</span>
                                <span>30%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-4 italic font-medium">Based on last 50 pictogram sentences shared</p>
                      </div>

                      {/* Engagement Chart */}
                      <div className="border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 hover:border-purple-200 dark:hover:border-purple-800 transition-colors shadow-sm">
                          <h3 className="text-sm font-black mb-4 flex items-center gap-2">🎯 Weekly Interaction Time</h3>
                          <div className="flex items-end gap-2 h-24 mt-2 justify-center">
                             {[40, 65, 30, 80, 50, 90, 75].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                  <div className="w-full h-full flex flex-col justify-end">
                                    <div className="w-full bg-purple-200 dark:bg-purple-900/50 group-hover:bg-purple-500 rounded-t-sm transition-colors relative" style={{ height: `${val}%` }}>
                                      <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{val}m</div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-400">{"SMTWTFS"[i]}</span>
                                </div>
                             ))}
                          </div>
                          <p className="text-xs text-zinc-500 font-medium text-center mt-3">Daily Average: 61 minutes (+12% vs last week)</p>
                      </div>
                    </div>

                    {/* Weekly Report Summary */}
                    <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl border border-purple-500/10 p-6">
                      <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-purple-600 dark:text-purple-400">Summary Report: Mar 24 - Mar 31</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Social Progress</p>
                          <p className="text-sm font-bold">Increasing initiating speech. Responding 20% faster to AI Sage prompts.</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Emotional Peak</p>
                          <p className="text-sm font-bold">Highest "Calm" indicators on Wednesday after Breathing Garden.</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Focus Area</p>
                          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Needs more variation in Action pictograms (mostly using "Go").</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Activity Log */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black flex items-center justify-between">
                        Recent Activity History
                        <span className="text-[10px] text-zinc-500 font-medium lowercase italic">Last 7 days filtered</span>
                      </h3>
                      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {user.posts.length > 0 || user.testHistory.length > 0 ? (
                          <>
                            {user.posts.slice(0, 10).map((post, i) => (
                              <div key={`p-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center text-lg">{post.type === "Drawing" ? "🎨" : post.type === "Audio" ? "🎙️" : "🗣️"}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black truncate">{post.type} Expression</p>
                                  {post.type === "Drawing" && post.content.startsWith('data:image') ? (
                                    <img src={post.content} alt={post.caption || "Drawing"} className="max-w-[120px] max-h-[80px] object-cover rounded-lg mt-2 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                                  ) : (
                                    <p className="text-[11px] text-zinc-500 font-medium truncate italic">"{post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}"</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-zinc-400">{post.date}</p>
                                  <p className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Shared to Feed</p>
                                </div>
                              </div>
                            ))}
                            {user.testHistory.slice(0, 5).map((test, i) => (
                              <div key={`t-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-lg">🧪</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black truncate">{test.modelName} Test</p>
                                  <p className="text-[11px] text-zinc-500 font-medium">Risk Score: {test.score}/100 ({test.risk})</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-zinc-400">{test.date}</p>
                                  <p className="text-[9px] font-bold text-purple-500 uppercase tracking-tighter">Assessment</p>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="py-12 text-center space-y-2 opacity-50">
                             <div className="text-3xl">🏜️</div>
                             <p className="text-xs font-bold uppercase tracking-widest">No activities logged for this child yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={generatePDFReport}
                      disabled={isGeneratingPDF}
                      className="w-full py-4 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-all border border-purple-500/10 disabled:opacity-50"
                    >
                      {isGeneratingPDF ? (
                         <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin mr-2" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      )}
                      {isGeneratingPDF ? "Compiling Report..." : "Generate Full Clinical PDF Report"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ASD News Feed */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-black tracking-tight">ASD News & Research</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Latest developments in autism spectrum disorder</p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {ASD_NEWS.map((article) => (
                  <div key={article.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${article.categoryColor}`}>
                          {article.category}
                        </span>
                        <span className="text-xs text-zinc-400">{article.date} · {article.readTime}</span>
                      </div>
                      <h3 className="font-bold text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{article.summary}</p>
                      <p className="text-xs font-bold text-zinc-400">{article.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Personalized Insight */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="font-black text-lg">Your Insight</h3>
              </div>
              {latestTest ? (
                <>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    Based on your {totalTests} assessment{totalTests !== 1 ? 's' : ''}, your <span className="text-white font-bold">{latestTest.modelName}</span> test is the most recent. Your latest score is <span className="text-white font-bold">{latestTest.score}/100</span> indicating a <span className="text-white font-bold">{latestTest.risk}</span> risk profile.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Recommended Next Step</p>
                    <p className="text-sm text-white font-medium">{latestTest.risk === 'High' ? 'Consult a specialist immediately for a detailed clinical review.' : 'Continue regular monitoring and engage in recommended activities.'}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    You haven't completed any assessments yet. Start your first test to get personalized insights and neurodiversity support.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Getting Started</p>
                    <p className="text-sm text-white font-medium">Try the Behavioral Analysis model to begin your child's journey.</p>
                  </div>
                </>
              )}
            </div>

            {/* Community Hub Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-6 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center text-xl border border-white/20">🌱</div>
                  <div>
                    <h3 className="font-black text-base leading-tight">Community Garden</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Live · 6 friends active</span>
                    </div>
                  </div>
                </div>
                <p className="text-purple-100 text-sm leading-relaxed mb-5">
                  Share drawings, listen to stories, try mindfulness activities, and connect with peers & your AI mentor Sage.
                </p>
                <div className="flex gap-2 mb-5">
                  {["🎨", "🎙️", "📖", "🎯"].map((emoji, i) => (
                    <div key={i} className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-base backdrop-blur">{emoji}</div>
                  ))}
                </div>
                <Link
                  href="/community"
                  className="block w-full py-3 rounded-2xl bg-white text-purple-700 text-sm font-black text-center hover:bg-purple-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-purple-900/40"
                >
                  Enter Community →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-black text-base mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/test" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg">🧪</div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Take New Test</p>
                    <p className="text-xs text-zinc-400">3 models available</p>
                  </div>
                </Link>
                <Link href="/upload-report" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-lg">📤</div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Upload Report</p>
                    <p className="text-xs text-zinc-400">PDF, PNG, JPG accepted</p>
                  </div>
                </Link>
                <Link href="/community" className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group">
                  <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-lg">🌱</div>
                  <div className="text-left">
                    <p className="text-sm font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Community Garden</p>
                    <p className="text-xs text-zinc-400">Activities, friends & Sage AI</p>
                  </div>
                </Link>
                <button className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-lg">👨‍⚕️</div>
                  <div className="text-left">
                    <p className="text-sm font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Contact Specialist</p>
                    <p className="text-xs text-zinc-400">Connect with clinician</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Connected Clinicians */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-black text-base mb-4">Connected Clinicians</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">DR</div>
                  <div>
                    <p className="text-sm font-bold">Dr. Rani Sharma</p>
                    <p className="text-xs text-zinc-400">Child Psychiatrist</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-black">MA</div>
                  <div>
                    <p className="text-sm font-bold">Maya Agarwal</p>
                    <p className="text-xs text-zinc-400">Behavioral Therapist</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                </div>
              </div>
              <button className="mt-4 w-full text-xs font-bold py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Contact My Specialist
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-black text-base mb-1">Risk Score Trend</h3>
              <p className="text-xs text-zinc-400 mb-4">Across your {totalTests} test{totalTests !== 1 ? "s" : ""}</p>
              {totalTests === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center gap-1">
                  <p className="text-xs text-zinc-400 font-medium">No tests yet — your trend will appear here.</p>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-24">
                  {user.testHistory?.slice().reverse().map((test, i) => {
                    const barHeight = `${test.score}%`;
                    const barColor =
                      test.risk === "Low" ? "bg-green-500" :
                        test.risk === "Moderate" ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={test.id} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col justify-end h-20 relative">
                          <div
                            className={`w-full rounded-t-lg ${barColor} transition-all`}
                            style={{ height: barHeight }}
                            title={`${test.modelName}: ${test.score}`}
                          ></div>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold text-center leading-tight">
                          #{i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-green-500"></span>Low</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Moderate</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-red-500"></span>High</span>
              </div>
            </div>

            {/* Platform Note */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-3xl p-5 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">Platform Mission</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">
                Uniquely Us provides AI-powered screening and personalized neurodiversity support. Results are for informational purposes and do not replace clinical diagnosis.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        © 2026 Uniquely Us. All rights reserved. · AI screening is not a substitute for clinical diagnosis.
      </footer>
    </div>
  );
}
