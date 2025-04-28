import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { EnhanceMode, LectureCategory } from '@/lib/gemini-service';

// Initialize Groq with server-side API key
const initGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, category, notes, mode } = body;

    const groq = initGroq();

    switch (action) {
      case 'generateNotes':
        if (!transcript || !category) {
          return NextResponse.json(
            { error: 'Missing required fields: transcript or category' },
            { status: 400 }
          );
        }
        const response = await generateNotesFromTranscript(groq, transcript, category as LectureCategory);
        return NextResponse.json({ result: response });

      case 'enhanceNotes':
        if (!notes || !mode) {
          return NextResponse.json(
            { error: 'Missing required fields: notes or mode' },
            { status: 400 }
          );
        }
        const enhancedNotes = await enhanceNotes(groq, notes, mode as EnhanceMode);
        return NextResponse.json({ result: enhancedNotes });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateNotesFromTranscript(
  groq: Groq,
  transcript: string,
  category: LectureCategory
): Promise<string> {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: getSystemInstruction()
      },
      {
        role: "user",
        content: transcript
      }
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.7,
    max_completion_tokens: 5000,
    top_p: 1,
    stream: false,
    stop: null
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

async function enhanceNotes(
  groq: Groq,
  notes: string,
  mode: EnhanceMode
): Promise<string> {
  const instructions = {
    detailed: "Make these notes more detailed by expanding explanations and adding examples:",
    shorter: "Summarize these notes into a more concise version while keeping the key points:",
    simpler: "Simplify these notes to make them easier to understand:",
    complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
  };

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: getEnhanceSystemInstruction()
      },
      {
        role: "user",
        content: `${instructions[mode]}\n\n${notes}`
      }
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.7,
    max_completion_tokens: 2048,
    top_p: 1,
    stream: false,
    stop: null
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

function getSystemInstruction(): string {
  return `# System Instructions

## Role and Purpose
You are an advanced AI assistant specializing in processing and summarizing raw lecture transcripts. Your goal is to convert spoken, unstructured text into well-organized, clear, and comprehensive notes that help students understand and retain key concepts.

[Rest of the system instruction as in the original file]`;
}

function getEnhanceSystemInstruction(): string {
  return `# System Instructions

## Role and Purpose
You are an AI assistant that helps enhance and modify lecture notes. Your goal is to adapt and refine the notes while maintaining their academic value and structured format.

## Key Guidelines
1. Preserve all markdown formatting and hierarchical structure
2. Maintain organized sections (Key Concepts, Formulas, Applications, etc.)
3. Keep consistent formatting for headings, bullet points, and emphasis
4. Adapt content based on the requested enhancement mode while preserving academic accuracy
5. Ensure clear transitions between topics and concepts
6. Use appropriate academic terminology based on the subject matter

📌 Important: Always maintain the structural integrity of the notes while applying the requested modifications.`;
}