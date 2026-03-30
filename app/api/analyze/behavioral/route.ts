import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, BehavioralAnswers } from "@/app/types/analysis";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze/behavioral
//
// Accepts: { modelId: "behavioral", answers: Record<questionId, score 1-5> }
// Returns: AnalysisResult JSON
//
// HOW TO CONNECT YOUR REAL MODEL:
//   Find the block marked "YOUR MODEL CODE GOES HERE" below.
//   Replace the mock logic inside with your actual model call.
//   The function receives 'answers' (an object of question scores)
//   and must return: score (0-100), confidence (0-100), and findings.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers }: { answers: BehavioralAnswers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'answers' field." },
        { status: 400 }
      );
    }

    // ─── YOUR MODEL CODE GOES HERE ──────────────────────────────────────────
    //
    // Replace this entire block with your real model inference.
    //
    // Option A — Call a local Python model server (Flask/FastAPI):
    //   const res = await fetch("http://localhost:5000/predict", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ answers }),
    //   });
    //   const modelOutput = await res.json();
    //   // modelOutput should have: { score, confidence, findings }
    //
    // Option B — Call a cloud/Hugging Face inference endpoint:
    //   const res = await fetch("https://api-inference.huggingface.co/models/YOUR_MODEL", {
    //     method: "POST",
    //     headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
    //     body: JSON.stringify({ inputs: answers }),
    //   });
    //   const modelOutput = await res.json();
    //
    // Option C — Run a JS/WASM model directly here:
    //   import { runModel } from "@/lib/behavioral-model";
    //   const modelOutput = await runModel(answers);
    //
    // After replacing, make sure modelOutput provides:
    //   modelOutput.score        → number 0-100
    //   modelOutput.confidence   → number 0-100
    //   modelOutput.findings     → array of { label, score, comment }
    //
    const modelOutput = runMockBehavioralModel(answers);
    // ─── END OF MODEL INTEGRATION BLOCK ─────────────────────────────────────

    const result: AnalysisResult = buildResult(modelOutput);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[BehavioralRoute] Error:", err);
    return NextResponse.json(
      { error: "Internal server error during behavioral analysis." },
      { status: 500 }
    );
  }
}

// ─── MOCK MODEL (delete this function when your real model is connected) ─────
function runMockBehavioralModel(answers: BehavioralAnswers) {
  const questionIds = Object.keys(answers);
  
  // Questions where 1 (Never) is atypical = Invert (High Risk is Low Rating)
  // These are questions like "My child makes eye contact", "Responds to name", etc.
  // IDs: q01-q08, q19-q20
  const invertedIds = ["q01", "q02", "q03", "q04", "q05", "q06", "q07", "q08", "q19", "q20"];

  let totalRiskPoints = 0;
  questionIds.forEach(id => {
    const val = answers[id] ?? 3;
    if (invertedIds.includes(id)) {
      // 1 -> 5 (High Risk), 5 -> 1 (Low Risk)
      totalRiskPoints += (6 - val);
    } else {
      // 5 -> 5 (High Risk), 1 -> 1 (Low Risk)
      totalRiskPoints += val;
    }
  });

  const averageRisk = totalRiskPoints / Math.max(questionIds.length, 1);

  // Normalise 1-5 scale → 0-100 (5 = most atypical → highest risk)
  const rawScore = Math.round(((averageRisk - 1) / 4) * 100);

  return {
    score: rawScore,
    confidence: 85 + Math.floor(Math.random() * 10), // Varies confidence 85-95%
    findings: [
      { label: "Social Reciprocity",       score: randomNear(rawScore, 10), comment: "Analysis of eye contact and joint attention markers." },
      { label: "Restricted Interests",     score: randomNear(rawScore,  5), comment: "Fixation on specific routines or objects identified." },
      { label: "Repetitive Behaviors",     score: randomNear(rawScore, 12), comment: "Specific repetitive motor or vocal patterns analyzed." },
      { label: "Communication Style",      score: randomNear(rawScore, 15), comment: "Literal language processing and back-and-forth speech flow." },
      { label: "Sensory Responsiveness",   score: randomNear(rawScore,  7), comment: "Sensitivity to environmental stimuli assessed." },
    ],
  };
}

function randomNear(base: number, spread: number): number {
  return Math.min(100, Math.max(0, base + Math.floor((Math.random() - 0.5) * spread * 2)));
}

// ─── RESULT BUILDER (shared logic — do not modify) ──────────────────────────
function buildResult(modelOutput: {
  score: number;
  confidence: number;
  findings: Array<{ label: string; score: number; comment: string }>;
}): AnalysisResult {
  const { score, confidence, findings } = modelOutput;

  const riskLevel = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";

  const asdLevel =
    score >= 75
      ? "Level 3 — Requiring Very Substantial Support"
      : score >= 50
      ? "Level 2 — Requiring Substantial Support"
      : score >= 30
      ? "Level 1 — Requiring Support"
      : "Sub-threshold — No ASD Indicated";

  return {
    modelId: "behavioral",
    modelName: "Behavioral Analysis Model",
    timestamp: new Date().toISOString(),
    riskLevel,
    asdLevel,
    overallScore: score,
    confidence,
    summary:
      score >= 50
        ? `The behavioral assessment detected patterns consistent with ${asdLevel}. Multiple social-communication and restricted/repetitive behavior markers were identified. A formal evaluation by a qualified clinician is strongly recommended.`
        : score >= 30
        ? `Mild behavioral markers associated with ASD were detected. The findings fall within a sub-clinical range but warrant monitoring and follow-up with a developmental specialist.`
        : `Behavioral patterns assessed are largely within typical developmental ranges. No significant ASD markers were identified in this screening.`,
    findings,
    interventions: getInterventions(asdLevel),
    nextSteps: getNextSteps(riskLevel),
    disclaimer:
      "This is an AI-assisted screening tool and does not constitute a clinical diagnosis. Results should be reviewed by a qualified healthcare professional.",
  };
}

function getInterventions(asdLevel: string) {
  const base = [
    { type: "Applied Behavior Analysis (ABA)", description: "Structured, evidence-based therapy targeting social skills, communication, and reducing challenging behaviors.", priority: "High" as const },
    { type: "Social Skills Training", description: "Structured group or individual sessions to develop conversation, turn-taking, and perspective-taking skills.", priority: "High" as const },
    { type: "Cognitive Behavioral Therapy (CBT)", description: "Helps manage anxiety, emotional regulation, and rigid thinking patterns common in ASD.", priority: "Medium" as const },
    { type: "Occupational Therapy", description: "Addresses sensory processing, fine motor skills, and daily living activities.", priority: "Medium" as const },
    { type: "Parental/Family Training", description: "Coaches caregivers in ABA strategies and naturalistic developmental approaches.", priority: "Medium" as const },
    { type: "Speech-Language Therapy", description: "Targets pragmatic language, conversation, and non-literal language understanding.", priority: "High" as const },
  ];

  if (asdLevel.includes("Level 3")) return base;
  if (asdLevel.includes("Level 2")) return base.slice(0, 4);
  if (asdLevel.includes("Level 1")) return [base[1], base[2], base[3]];
  return [base[1], { type: "Monitoring & Check-ins", description: "Regular developmental check-ins every 6 months to track any changes.", priority: "Low" as const }];
}

function getNextSteps(riskLevel: string) {
  if (riskLevel === "High") {
    return [
      { order: 1, action: "Seek immediate specialist referral", detail: "Contact your GP or pediatrician today to request a referral to a developmental pediatrician or child psychiatrist." },
      { order: 2, action: "Start ABA therapy assessment", detail: "Contact a certified ABA provider for an intake evaluation to begin early intervention." },
      { order: 3, action: "Schedule speech-language evaluation", detail: "Book an assessment with an SLP who specializes in autism spectrum disorders." },
      { order: 4, action: "Connect with an occupational therapist", detail: "OT can begin addressing sensory and motor needs while awaiting a formal diagnosis." },
      { order: 5, action: "Save and share these results", detail: "Download this report and share it with your healthcare team for the formal evaluation." },
    ];
  }
  if (riskLevel === "Moderate") {
    return [
      { order: 1, action: "Consult a developmental specialist", detail: "Schedule an appointment with a developmental pediatrician within 4-6 weeks." },
      { order: 2, action: "Begin social skills support", detail: "Enroll in a social skills group or begin individual social coaching sessions." },
      { order: 3, action: "Monitor behavioral patterns", detail: "Keep a behavioral diary noting triggers, frequencies, and contexts of notable behaviors." },
      { order: 4, action: "Re-run assessment in 3 months", detail: "Repeat this screening after any interventions to track changes." },
    ];
  }
  return [
    { order: 1, action: "Share results with your GP", detail: "Discuss these findings at your next scheduled checkup." },
    { order: 2, action: "Monitor for changes", detail: "If behaviors change or intensify, re-run this assessment and consult a specialist." },
    { order: 3, action: "Explore community resources", detail: "Look into neurodiversity-friendly programs and community support groups." },
  ];
}
