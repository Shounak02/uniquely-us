// Shared TypeScript types for the AI Analysis pipeline
// Used by both API routes (backend) and React pages (frontend)
// ─────────────────────────────────────────────────────────────────────────────

export type ModelId = "behavioral" | "visual" | "speech";

export type RiskLevel = "Low" | "Moderate" | "High";

// DSM-5 Autism Spectrum Disorder Levels
export type ASDLevel =
  | "Level 1 — Requiring Support"
  | "Level 2 — Requiring Substantial Support"
  | "Level 3 — Requiring Very Substantial Support"
  | "Sub-threshold — No ASD Indicated";

// ─── REQUEST SHAPES (what the frontend sends to the API) ─────────────────────

export type BehavioralAnswers = Record<string, number>; // questionId → score 1-5

export type VisualScores = {
  gazeDeviation: number;       // 0.0 – 1.0
  patternFocus: number;        // 0.0 – 1.0
  socialStimuli: number;       // 0.0 – 1.0 (lower = less engagement)
  repetitiveInterest: number;  // 0.0 – 1.0
  complexGeometric: number;    // 0.0 – 1.0
  imageFile?: string;          // base64 if an image is uploaded
};

export type SpeechInputs = {
  transcription?: string;      // paste or auto-transcribed text
  audioFileBase64?: string;    // base64-encoded audio if uploaded
  durationSeconds?: number;
  features?: {
    prosodyVariation: number;  // 0.0 – 1.0
    repetitionRate: number;    // 0.0 – 1.0
    echolaliaScore: number;    // 0.0 – 1.0
    socialPhrasing: number;    // 0.0 – 1.0 (higher = more typical)
  };
};

export type AnalysisRequest =
  | { modelId: "behavioral"; answers: BehavioralAnswers }
  | { modelId: "visual"; scores: VisualScores }
  | { modelId: "speech"; inputs: SpeechInputs };

// ─── RESULT SHAPE (what the API sends back to the frontend) ──────────────────

export type Intervention = {
  type: string;           // e.g. "Applied Behavior Analysis (ABA)"
  description: string;   // Short explanation
  priority: "High" | "Medium" | "Low";
};

export type NextStep = {
  order: number;
  action: string;        // e.g. "Consult a developmental pediatrician"
  detail: string;
};

export type Finding = {
  label: string;         // e.g. "Social Reciprocity"
  score: number;         // 0–100 raw subscale score
  comment: string;       // One-line interpretation
};

export type AnalysisResult = {
  modelId: ModelId;
  modelName: string;
  timestamp: string;           // ISO 8601
  riskLevel: RiskLevel;
  asdLevel: ASDLevel;
  overallScore: number;        // 0–100 composite
  confidence: number;          // 0–100 model confidence %
  summary: string;             // 2-3 sentence narrative
  findings: Finding[];         // Per-dimension subscores
  interventions: Intervention[]; // Recommended therapies/strategies
  nextSteps: NextStep[];       // Ordered action items
  disclaimer: string;
};

// ─── STORED TEST RESULT (extends AnalysisResult for dashboard history) ────────
export type StoredTestResult = AnalysisResult & {
  id: string;
  userId: string;
};
