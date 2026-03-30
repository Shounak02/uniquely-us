import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, VisualScores } from "@/app/types/analysis";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze/visual
//
// Accepts: { modelId: "visual", scores: VisualScores }
//   VisualScores = { gazeDeviation, patternFocus, socialStimuli,
//                   repetitiveInterest, complexGeometric, imageFile? }
//   All score fields are 0.0 – 1.0. imageFile is optional base64 string.
//
// Returns: AnalysisResult JSON
//
// HOW TO CONNECT YOUR REAL MODEL:
//   Find the block marked "YOUR MODEL CODE GOES HERE" below.
//   Replace the mock logic with your actual model call.
//   Input: 'scores' object (and optionally 'imageFile' base64)
//   Output needed: { score: number, confidence: number, findings: array }
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scores }: { scores: VisualScores } = body;

    if (!scores || typeof scores !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'scores' field." },
        { status: 400 }
      );
    }

    // ─── YOUR MODEL CODE GOES HERE ──────────────────────────────────────────
    //
    // Replace this entire block with your real visual model inference.
    //
    // Option A — Call a local Python model server (Flask/FastAPI) with image:
    //   const res = await fetch("http://localhost:5001/predict-visual", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       gaze_deviation: scores.gazeDeviation,
    //       pattern_focus: scores.patternFocus,
    //       social_stimuli: scores.socialStimuli,
    //       repetitive_interest: scores.repetitiveInterest,
    //       complex_geometric: scores.complexGeometric,
    //       image_base64: scores.imageFile,        // optional
    //     }),
    //   });
    //   const modelOutput = await res.json();
    //
    // Option B — Call a vision AI API (e.g. Google Vision + your classifier):
    //   const visionRes = await fetch("https://vision.googleapis.com/...", { ... });
    //   const modelOutput = processVisionResponse(visionRes, scores);
    //
    // Option C — Call a Hugging Face vision model:
    //   const res = await fetch(
    //     "https://api-inference.huggingface.co/models/YOUR_VISION_MODEL",
    //     {
    //       method: "POST",
    //       headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
    //       body: scores.imageFile
    //         ? Buffer.from(scores.imageFile, "base64")
    //         : JSON.stringify(scores),
    //     }
    //   );
    //   const modelOutput = await res.json();
    //
    // Required output shape:
    //   modelOutput.score        → number 0-100
    //   modelOutput.confidence   → number 0-100
    //   modelOutput.findings     → Array<{ label, score, comment }>
    //
    const modelOutput = runMockVisualModel(scores);
    // ─── END OF MODEL INTEGRATION BLOCK ─────────────────────────────────────

    const result: AnalysisResult = buildVisualResult(modelOutput, !!scores.imageFile);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[VisualRoute] Error:", err);
    return NextResponse.json(
      { error: "Internal server error during visual pattern analysis." },
      { status: 500 }
    );
  }
}

// ─── MOCK MODEL (delete when your real model is connected) ───────────────────
function runMockVisualModel(scores: VisualScores) {
  // Gaze deviation & pattern focus are the strongest ASD indicators visually
  const weightedScore =
    scores.gazeDeviation * 35 +
    scores.patternFocus * 25 +
    (1 - scores.socialStimuli) * 20 +
    scores.complexGeometric * 20;

  const rawScore = Math.round(Math.min(100, weightedScore));

  return {
    score: rawScore,
    confidence: 82,
    findings: [
      { label: "Gaze Deviation",         score: Math.round(scores.gazeDeviation * 100),       comment: "Atypical gaze patterns during social stimuli presentation." },
      { label: "Pattern Focus",          score: Math.round(scores.patternFocus * 100),         comment: "Elevated sustained attention to complex, non-social patterns." },
      { label: "Social Stimuli Response",score: Math.round((1 - scores.socialStimuli) * 100), comment: "Reduced orienting to social and face-related visual stimuli." },
      { label: "Repetitive Interest",    score: Math.round(scores.repetitiveInterest * 100),  comment: "Strong interest in repetitive or looping visual sequences." },
      { label: "Complex Geometric",      score: Math.round(scores.complexGeometric * 100),    comment: "Heightened engagement with geometric and abstract visuals." },
    ],
  };
}

function buildVisualResult(
  modelOutput: { score: number; confidence: number; findings: Array<{ label: string; score: number; comment: string }> },
  usedImage: boolean
): AnalysisResult {
  const { score, confidence, findings } = modelOutput;
  const riskLevel = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";
  const asdLevel =
    score >= 75 ? "Level 3 — Requiring Very Substantial Support"
    : score >= 50 ? "Level 2 — Requiring Substantial Support"
    : score >= 30 ? "Level 1 — Requiring Support"
    : "Sub-threshold — No ASD Indicated";

  return {
    modelId: "visual",
    modelName: "Visual Pattern Recognition",
    timestamp: new Date().toISOString(),
    riskLevel,
    asdLevel,
    overallScore: score,
    confidence,
    summary:
      score >= 50
        ? `Visual pattern analysis identified significant deviations in gaze and social visual engagement consistent with ${asdLevel}. ${usedImage ? "Image analysis was incorporated into the assessment." : "Assessment was based on rated visual attention scores."} Formal evaluation is recommended.`
        : score >= 30
        ? `Mild atypical visual attention patterns detected. Results fall below clinical threshold but suggest monitoring. Consider a full ophthalmological and developmental evaluation.`
        : `Visual attention patterns are within typical developmental parameters. No clinically significant ASD visual markers detected.`,
    findings,
    interventions: [
      { type: "Vision Therapy",              description: "Specialized therapy to improve visual processing, tracking, and integration.", priority: "High" as const },
      { type: "Sensory Integration Therapy", description: "Addresses over/under-sensitivity to visual stimuli and improves adaptive responses.", priority: "High" as const },
      { type: "Social Stories with Visuals", description: "Uses picture-based narratives to teach social cues and expected behaviors.", priority: "Medium" as const },
      { type: "Joint Attention Training",    description: "Structured activities to build shared focus on objects between child and caregiver.", priority: "Medium" as const },
    ].slice(0, score >= 50 ? 4 : 2),
    nextSteps: [
      { order: 1, action: "Ophthalmology referral",           detail: "Rule out any underlying vision conditions before attributing results to ASD." },
      { order: 2, action: "Developmental pediatrician",       detail: "Share these results for a comprehensive neurodevelopmental evaluation." },
      { order: 3, action: "Sensory occupational therapy OT",  detail: "Begin OT focused on visual-sensory integration and daily adaptations." },
      { order: 4, action: "Re-test with image upload",        detail: "For higher accuracy, run the test again with a photo or gaze-tracking data." },
    ].slice(0, riskLevel === "High" ? 4 : 2),
    disclaimer: "This is an AI-assisted screening tool and does not constitute a clinical diagnosis.",
  };
}
