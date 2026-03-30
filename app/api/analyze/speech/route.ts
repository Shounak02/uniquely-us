import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, SpeechInputs } from "@/app/types/analysis";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze/speech
//
// Accepts: { modelId: "speech", inputs: SpeechInputs }
//   SpeechInputs = {
//     transcription?: string,       // pasted or auto-transcribed text
//     audioFileBase64?: string,     // base64 audio file (wav/mp3)
//     durationSeconds?: number,
//     features?: {                  // manually rated speech features
//       prosodyVariation,           // 0.0 – 1.0
//       repetitionRate,             // 0.0 – 1.0
//       echolaliaScore,             // 0.0 – 1.0
//       socialPhrasing,             // 0.0 – 1.0 (higher = more typical)
//     }
//   }
//
// Returns: AnalysisResult JSON
//
// HOW TO CONNECT YOUR REAL MODEL:
//   Find the block marked "YOUR MODEL CODE GOES HERE" below.
//   Your model should accept audio file bytes or a transcription string
//   and return: { score, confidence, findings }
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputs }: { inputs: SpeechInputs } = body;

    if (!inputs || (!inputs.transcription && !inputs.audioFileBase64 && !inputs.features)) {
      return NextResponse.json(
        { error: "Provide at least one of: transcription, audioFileBase64, or features." },
        { status: 400 }
      );
    }

    // ─── YOUR MODEL CODE GOES HERE ──────────────────────────────────────────
    //
    // Replace this entire block with your real speech model inference.
    //
    // Option A — Call a local speech analysis server (Flask/FastAPI):
    //   const res = await fetch("http://localhost:5002/predict-speech", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       transcription: inputs.transcription,
    //       audio_base64: inputs.audioFileBase64,   // optional
    //       duration_s: inputs.durationSeconds,
    //       features: inputs.features,
    //     }),
    //   });
    //   const modelOutput = await res.json();
    //
    // Option B — Use OpenAI Whisper for transcription, then your classifier:
    //   // Step 1: transcribe if audio provided
    //   let text = inputs.transcription;
    //   if (inputs.audioFileBase64 && !text) {
    //     const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    //       method: "POST",
    //       headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    //       body: formDataWithAudio(inputs.audioFileBase64),
    //     });
    //     text = (await whisperRes.json()).text;
    //   }
    //   // Step 2: run your speech pattern classifier on 'text'
    //   const modelOutput = await yourSpeechClassifier(text);
    //
    // Option C — Hugging Face Audio Classification:
    //   const res = await fetch(
    //     "https://api-inference.huggingface.co/models/YOUR_SPEECH_MODEL",
    //     {
    //       method: "POST",
    //       headers: { Authorization: `Bearer ${process.env.HF_API_KEY}`, "Content-Type": "audio/wav" },
    //       body: Buffer.from(inputs.audioFileBase64 ?? "", "base64"),
    //     }
    //   );
    //   const modelOutput = await res.json();
    //
    // Required output shape:
    //   modelOutput.score        → number 0-100
    //   modelOutput.confidence   → number 0-100
    //   modelOutput.findings     → Array<{ label, score, comment }>
    //
    const modelOutput = runMockSpeechModel(inputs);
    // ─── END OF MODEL INTEGRATION BLOCK ─────────────────────────────────────

    const result: AnalysisResult = buildSpeechResult(modelOutput, inputs);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[SpeechRoute] Error:", err);
    return NextResponse.json(
      { error: "Internal server error during speech pattern analysis." },
      { status: 500 }
    );
  }
}

// ─── MOCK SPEECH MODEL (delete when your real model is connected) ────────────
function runMockSpeechModel(inputs: SpeechInputs) {
  let rawScore = 50; // default

  if (inputs.features) {
    const { prosodyVariation, repetitionRate, echolaliaScore, socialPhrasing } = inputs.features;
    // Higher prosody variation, repetition, and echolalia = more atypical
    // Lower social phrasing = more atypical
    rawScore = Math.round(
      prosodyVariation * 25 +
      repetitionRate * 30 +
      echolaliaScore * 25 +
      (1 - socialPhrasing) * 20
    );
  } else if (inputs.transcription) {
    // Very simple heuristic on transcription text
    const text = inputs.transcription.toLowerCase();
    const repetitions = countRepetitions(text);
    const wordCount = text.split(/\s+/).length;
    rawScore = Math.min(100, Math.round((repetitions / Math.max(wordCount, 1)) * 300 + 30));
  }

  const f = inputs.features;
  return {
    score: rawScore,
    confidence: inputs.audioFileBase64 ? 85 : inputs.transcription ? 72 : 65,
    findings: [
      { label: "Prosodic Variation",    score: f ? Math.round(f.prosodyVariation * 100) : randomNear(rawScore, 10), comment: "Atypical rhythm and intonation patterns detected across utterances." },
      { label: "Repetitive Phrasing",  score: f ? Math.round(f.repetitionRate * 100)   : randomNear(rawScore,  8), comment: "Elevated rate of word and phrase repetition noted." },
      { label: "Echolalia Markers",    score: f ? Math.round(f.echolaliaScore * 100)    : randomNear(rawScore, 12), comment: "Immediate and delayed echolalic speech patterns identified." },
      { label: "Social Phrasing",      score: f ? Math.round((1 - f.socialPhrasing) * 100) : randomNear(rawScore, 9), comment: "Reduced use of conventional social expressions and greetings." },
      { label: "Pragmatic Language",   score: randomNear(rawScore, 11), comment: "Literal interpretation tendency; limited use of figurative language." },
    ],
  };
}

function countRepetitions(text: string): number {
  const words = text.split(/\s+/);
  const seen = new Set<string>();
  let repeats = 0;
  for (const w of words) {
    if (seen.has(w)) repeats++;
    seen.add(w);
  }
  return repeats;
}

function randomNear(base: number, spread: number): number {
  return Math.min(100, Math.max(0, base + Math.floor((Math.random() - 0.5) * spread * 2)));
}

function buildSpeechResult(
  modelOutput: { score: number; confidence: number; findings: Array<{ label: string; score: number; comment: string }> },
  inputs: SpeechInputs
): AnalysisResult {
  const { score, confidence, findings } = modelOutput;
  const riskLevel = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";
  const asdLevel =
    score >= 75 ? "Level 3 — Requiring Very Substantial Support"
    : score >= 50 ? "Level 2 — Requiring Substantial Support"
    : score >= 30 ? "Level 1 — Requiring Support"
    : "Sub-threshold — No ASD Indicated";

  const inputMethod = inputs.audioFileBase64 ? "audio recording" : inputs.transcription ? "transcription text" : "rated speech features";

  return {
    modelId: "speech",
    modelName: "Speech Pattern Analysis",
    timestamp: new Date().toISOString(),
    riskLevel,
    asdLevel,
    overallScore: score,
    confidence,
    summary:
      score >= 50
        ? `Speech pattern analysis of the provided ${inputMethod} detected markers consistent with ${asdLevel}. Elevated prosodic irregularities, repetitive phrasing, and pragmatic language challenges were identified. A formal speech-language evaluation is recommended.`
        : score >= 30
        ? `Mild speech pattern deviations were detected in the ${inputMethod}. While results do not meet clinical thresholds, monitoring and a speech-language checkup are advisable.`
        : `Speech patterns analyzed from the ${inputMethod} fall within typical developmental ranges. No significant ASD-related speech markers were identified.`,
    findings,
    interventions: [
      { type: "Speech-Language Therapy (SLT)", description: "Targets pragmatic communication, conversation skills, and prosody regulation.", priority: "High" as const },
      { type: "Augmentative & Alternative Communication (AAC)", description: "Introduces visual supports and communication devices to reduce echolalia dependency.", priority: "High" as const },
      { type: "Social Communication Groups", description: "Peer-based groups practicing real-world conversation, turn-taking, and topic maintenance.", priority: "Medium" as const },
      { type: "Naturalistic Language Therapy", description: "Uses everyday activities to build spontaneous, functional communication.", priority: "Medium" as const },
      { type: "Music & Rhythm Therapy", description: "Uses musical cues to improve prosody, rhythm, and expressive communication.", priority: "Low" as const },
    ].slice(0, score >= 50 ? 5 : score >= 30 ? 3 : 2),
    nextSteps: [
      { order: 1, action: "Book an SLP evaluation",            detail: "Seek a licensed speech-language pathologist who specializes in autism spectrum communication." },
      { order: 2, action: "Share results with your physician", detail: "Bring this report to your next GP visit for referral consideration." },
      { order: 3, action: "Begin early communication support", detail: "Start using visual schedules and social stories at home while awaiting formal assessment." },
      { order: 4, action: "Re-run with audio upload for accuracy", detail: "If you used text/features, re-run with a voice recording for higher confidence results." },
    ].slice(0, riskLevel === "High" ? 4 : riskLevel === "Moderate" ? 3 : 2),
    disclaimer: "This is an AI-assisted screening tool and does not constitute a clinical diagnosis.",
  };
}
