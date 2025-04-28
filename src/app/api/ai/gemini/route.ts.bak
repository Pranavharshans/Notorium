import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { EnhanceMode, LectureCategory } from '@/lib/gemini-service';

// Initialize Gemini with server-side API key
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, category, notes, mode } = body;

    const gemini = initGemini();

    switch (action) {
      case 'generateNotes':
        if (!transcript || !category) {
          return NextResponse.json(
            { error: 'Missing required fields: transcript or category' },
            { status: 400 }
          );
        }
        const response = await generateNotesFromTranscript(gemini, transcript, category as LectureCategory);
        return NextResponse.json({ result: response });

      case 'enhanceNotes':
        if (!notes || !mode) {
          return NextResponse.json(
            { error: 'Missing required fields: notes or mode' },
            { status: 400 }
          );
        }
        const enhancedNotes = await enhanceNotes(gemini, notes, mode as EnhanceMode);
        return NextResponse.json({ result: enhancedNotes });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateNotesFromTranscript(
  gemini: GoogleGenAI,
  transcript: string,
  category: LectureCategory
): Promise<string> {
  const systemInstruction = getSystemInstruction();
  const categoryInstructions = getCategorySpecificInstructions(category);
  const combinedInstructions = `${systemInstruction}\n\n${categoryInstructions}`;

  const response = await gemini.models.generateContent({
    model: "gemini-2.0-flash",
    contents: transcript,
    config: {
      systemInstruction: combinedInstructions
    }
  });

  return response.text ?? '';
}

async function enhanceNotes(
  gemini: GoogleGenAI,
  notes: string,
  mode: EnhanceMode
): Promise<string> {
  const instructions = {
    detailed: "Make these notes more detailed by expanding explanations and adding examples:",
    shorter: "Summarize these notes into a more concise version while keeping the key points:",
    simpler: "Simplify these notes to make them easier to understand:",
    complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
  };

  const response = await gemini.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${instructions[mode]}\n\n${notes}`,
  });

  return response.text ?? '';
}

function getSystemInstruction(): string {
  // Copy the system instruction from gemini-service.ts
  return `# System Instructions...`; // Add the complete instruction here
}

function getCategorySpecificInstructions(category: LectureCategory): string {
  // Copy the category specific instructions from gemini-service.ts
  const baseInstructions = `# System Instructions...`; // Add the complete instruction here
  const categoryInstructions = {
    programming: `...`, // Add category specific instructions
    mathematics: `...`,
    science: `...`,
    humanities: `...`,
    business: `...`,
    law: `...`,
    medicine: `...`,
    engineering: `...`,
    general: `...`
  };

  return `${baseInstructions}\n${categoryInstructions[category]}`;
}