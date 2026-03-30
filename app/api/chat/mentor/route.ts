import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// If we had a ChatLog model in prisma, we would import it here:
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// 1. Safety Check Layer
const HARMFUL_KEYWORDS = ["hurt myself", "panic", "crying badly", "die", "kill", "pain"];

// 2. Intent & Emotion Combinations (Decision Layer)
const RESPONSE_TEMPLATES: Record<string, { text: string[], options: string[] }> = {
  "Fear_Social": {
    text: [
      "I understand you feel scared. It's totally completely normal to feel that way.",
      "Let's try this together:",
      "1. Take a slow, deep breath in.",
      "2. Remind yourself that you are safe.",
      "3. Say 'Hello' slowly when you are ready."
    ],
    options: ["Practice Conversation", "Calm Down Exercise"]
  },
  "Fear_School": {
    text: [
      "School can definitely feel overwhelming sometimes. You are very brave for talking about it.",
      "Here is a small plan:",
      "1. Squeeze your hands into tight fists, then release them.",
      "2. Ask a teacher for a 2-minute break if it's too bright or loud.",
      "3. Focus on just one small task at a time."
    ],
    options: ["Breathing Exercise", "Talk to Sage"]
  },
  "Anger_Social": {
    text: [
      "I can hear that you are feeling very angry. It is okay to be mad.",
      "Let's work through this safely:",
      "1. Step away from the person making you mad.",
      "2. Count backwards from 10.",
      "3. Use your words to say 'I need some space right now'."
    ],
    options: ["Counting Stars", "Draw My Feelings"]
  },
  "Joy_Play": {
    text: [
      "That sounds so wonderful! I am so happy for you! 🌟",
      "When we feel joy, it's great to share it:",
      "1. Smile huge!",
      "2. Tell a friend or your parents.",
      "3. Remember this happy feeling for tomorrow."
    ],
    options: ["Share to Community", "Write a Story"]
  },
  "Sadness_School": {
    text: [
      "I'm sorry you're feeling sad. Sending you a gentle virtual hug. 💙",
      "Let's try to feel a little bit better:",
      "1. Wrap yourself in a cozy blanket if you have one.",
      "2. Drink a glass of cold water.",
      "3. Draw a picture of something you love."
    ],
    options: ["Drawing Garden", "Pattern Puzzler"]
  }
};

const DEFAULT_TEMPLATE = {
  text: [
    "I'm listening to you carefully. 🌿",
    "Let's think about this together:",
    "1. Notice how your body feels right now.",
    "2. Remember that I'm always here to listen.",
    "3. Tell me a little bit more whenever you're ready."
  ],
  options: ["Tell me more", "Play a game"]
};

// Main Chat Route
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    
    // Step 1: Input Processing
    const processedMessage = typeof message === 'string' ? message.toLowerCase().replace(/[^\w\s]/gi, '') : '';

    // Step 2 & 5: Safety Check Layer
    const hasHarmfulContent = HARMFUL_KEYWORDS.some(keyword => processedMessage.includes(keyword));
    
    if (hasHarmfulContent) {
      // Override response safely
      return NextResponse.json({
        text: "I am hearing that you are feeling very overwhelmed right now. You are safe. Please take a deep breath. Can you show this message to a grown-up you trust right now? 🚨",
        options: ["Yes, I will", "Help me breathe"],
        powered_by: "safety-override"
      });
    }

    // Step 3: AI Analysis (Detect Emotion and Intent)
    let aiEmotion = "Neutral";
    let aiIntent = "Unknown";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Instructing the AI to strictly return JSON for classification
        const prompt = `
          Analyze the following message from an autistic child.
          Message: "${message}"
          
          Respond ONLY with a valid JSON object wrapped in \`\`\`json containing two keys:
          - "emotion": Classify as one of [Fear, Joy, Sadness, Anger, Neutral]
          - "intent": Classify as one of [Social, School, Home, Play, Unknown]
        `;

        const result = await model.generateContent(prompt);
        const aiResponseText = result.response.text();
        
        // Parse the JSON output
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : aiResponseText.replace(/`/g, '');
        
        const parsed = JSON.parse(jsonStr);
        aiEmotion = parsed.emotion || "Neutral";
        aiIntent = parsed.intent || "Unknown";

      } catch (aiError) {
        console.error("AI Classification Error - falling back:", aiError);
      }
    }

    // Step 4: Wrapper (Decision Layer)
    const ruleKey = `${aiEmotion}_${aiIntent}`;
    const selectedResponse = RESPONSE_TEMPLATES[ruleKey] || DEFAULT_TEMPLATE;

    // Step 6: Response Generation (Controlled)
    const formattedText = selectedResponse.text.join("\n\n");

    // Step 7: Database Logging
    // In production we would do:
    // await prisma.chatLog.create({ data: { message, emotion: aiEmotion, intent: aiIntent } });
    console.log(`[DB LOG] -> Message: "${message}" | Emotion: ${aiEmotion} | Intent: ${aiIntent} | Rule Applied: ${ruleKey}`);

    // Step 8: Response Delivery
    return NextResponse.json({
      text: formattedText,
      options: selectedResponse.options,
      debug: { emotion: aiEmotion, intent: aiIntent }, // Helpful for UI / debugging
      powered_by: "multi-intent-engine"
    });

  } catch (error) {
    console.error("Mentor chat error:", error);
    return NextResponse.json(
      { 
        text: "My system paused momentarily. Take a deep breath. What were you saying?", 
        options: ["Let's try again", "Breathe with me"],
        powered_by: "error-recovery" 
      },
      { status: 200 }
    );
  }
}
