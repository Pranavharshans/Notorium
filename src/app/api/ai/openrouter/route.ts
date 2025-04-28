import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EnhanceMode, LectureCategory } from '@/lib/openrouter-service';

const initOpenRouter = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'notorium.app',
      'X-Title': 'notorium',
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, category, notes, mode } = body;

    const openai = initOpenRouter();

    switch (action) {
      case 'generateNotes':
        if (!transcript || !category) {
          return NextResponse.json(
            { error: 'Missing required fields: transcript or category' },
            { status: 400 }
          );
        }
        const response = await generateNotesFromTranscript(openai, transcript, category as LectureCategory);
        return NextResponse.json({ result: response });

      case 'enhanceNotes':
        if (!notes || !mode) {
          return NextResponse.json(
            { error: 'Missing required fields: notes or mode' },
            { status: 400 }
          );
        }
        const enhancedNotes = await enhanceNotes(openai, notes, mode as EnhanceMode);
        return NextResponse.json({ result: enhancedNotes });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateNotesFromTranscript(
  openai: OpenAI,
  transcript: string,
  category: LectureCategory
): Promise<string> {
  const systemInstruction = getSystemInstruction();
  const categoryInstructions = getCategorySpecificInstructions(category);
  const combinedInstructions = `${systemInstruction}\n\n${categoryInstructions}`;

  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4.1-nano',
    messages: [
      {
        role: 'system',
        content: combinedInstructions
      },
      {
        role: 'user',
        content: transcript
      }
    ]
  });

  return completion.choices[0].message.content || '';
}

async function enhanceNotes(
  openai: OpenAI,
  notes: string,
  mode: EnhanceMode
): Promise<string> {
  const instructions = {
    detailed: "Make these notes more detailed by expanding explanations and adding examples:",
    shorter: "Summarize these notes into a more concise version while keeping the key points:",
    simpler: "Simplify these notes to make them easier to understand:",
    complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
  };

  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4.1-nano',
    messages: [
      {
        role: 'system',
        content: instructions[mode]
      },
      {
        role: 'user',
        content: notes
      }
    ]
  });

  return completion.choices[0].message.content || '';
}

function getSystemInstruction(): string {
  return `You are a helpful AI assistant that specializes in generating clear and well-structured notes from lecture transcripts. Your task is to:
1. Extract key concepts and important information
2. Organize the content in a logical sequence
3. Use markdown formatting for better readability
4. Include relevant examples when appropriate
5. Highlight important terms or concepts`;
}

function getCategorySpecificInstructions(category: LectureCategory): string {
  const instructions = {
    programming: "Focus on code examples, algorithms, and technical concepts. Use code blocks when appropriate.",
    mathematics: "Include formulas, theorems, and step-by-step problem-solving approaches. Use mathematical notation when needed.",
    science: "Emphasize scientific principles, experiments, and empirical evidence. Include relevant diagrams or experimental setups.",
    humanities: "Focus on historical context, cultural significance, and theoretical frameworks.",
    business: "Highlight business strategies, market analysis, and practical applications.",
    law: "Emphasize legal principles, case studies, and statutory interpretations.",
    medicine: "Focus on medical terminology, procedures, and clinical applications.",
    engineering: "Include technical specifications, design principles, and practical applications.",
    general: "Maintain a balanced approach, focusing on key concepts and their practical applications."
  };

  return instructions[category];
}