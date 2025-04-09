import Groq from 'groq-sdk';
import { EnhanceMode, LectureCategory } from './gemini-service';

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptionResponse {
  text: string;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionResult {
  text: string;
  segments?: {
    text: string;
    start: number;
    end: number;
  }[];
}

export class GroqService {
  private groq: Groq;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GROQ_API_KEY is not configured");
    }
    this.groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transcribe audio');
      }

      const transcription: TranscriptionResponse = await response.json();

      if (!transcription.text) {
        throw new Error('No transcription text received');
      }

      return {
        text: transcription.text,
        segments: transcription.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end
        }))
      };
    } catch (error) {
      console.error("Transcription error:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to transcribe audio: ${error.message}`);
      } else {
        throw new Error("Failed to transcribe audio: Unknown error");
      }
    }
  }

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<string> {
    try {
      if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("NEXT_PUBLIC_GROQ_API_KEY is not configured");
      }

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `# System Instructions

## Role and Purpose
You are an advanced AI assistant specializing in processing and summarizing raw lecture transcripts. Your goal is to convert spoken, unstructured text into well-organized, clear, and comprehensive notes that help students understand and retain key concepts.

🛠 Instructions for Processing the Lecture Transcript
1️⃣ Understanding the Transcript & Cleaning the Content
The input is a raw transcript of a college lecture, which may contain:

Filler words (e.g., "uh," "you know," "like")

Redundant phrases and repeated points

Informal speech patterns

Lack of punctuation or paragraph structure

Speaker interruptions or side conversations

Your tasks:

Refine the content for clarity and readability.

Correct punctuation and split long paragraphs logically.

Remove unnecessary words while preserving meaning.

Ensure proper sentence structure for easy comprehension.

2️⃣ Generate a Dynamic Summary Based on Lecture Length
Lecture LengthProcessing Approach
Short (<5 min)Generate a brief, high-level summary with key bullet points.
Medium (5-20 min)Provide a detailed, section-wise breakdown with examples.
Long (20+ min)Generate comprehensive, textbook-style notes with deep explanations, case studies, and real-world applications.
Ensure summaries maintain logical flow and follow a structured format.

If the transcript lacks coherence, reconstruct the meaning logically.

3️⃣ Generate Well-Structured Notes
Transform the raw transcript into hierarchical bullet points for clarity.

Ensure a logical flow between concepts.

Include the following structured elements:

📖 Key Concepts
Concept 1: Explanation

Concept 2: Explanation

📊 Important Formulas & Diagrams
plaintext
Formula: E = mc^2
Explanation of how it applies in physics.

💡 Real-World Applications
Application 1: [Example scenario]

Application 2: [Practical use case]

📚 Case Studies (For Longer Lectures)
Case Study 1: [Detailed explanation]

Case Study 2: [Historical reference]

🏆 Key Takeaways
[Main insights students should remember]

4️⃣ Enhancing Clarity, Readability & Depth
Fix incomplete sentences and reconstruct broken phrases logically.

Remove repetition while preserving key points.

Simplify overly complex explanations for better understanding.

Use Markdown formatting for readability:

Formatting TypeUsage
#Main Title
##Section Heading
###Subsection Heading
**bold**Highlight important terms
*italics*Emphasize words or phrases
\Code Blocks\Display formulas, key terms, or code
---Separate sections for better readability
Use tables when comparing concepts or organizing structured data.

📌 Important: Always include a space after # in headers

do not include statements in the beginning of the output like "Here is a summary of the lecture" or "The following are the key points". Instead, directly present the content in a structured format.`
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
    } catch (error) {
      console.error("Generate notes error:", error);
      throw error;
    }
  }

  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    try {
      const instructions = {
        detailed: "Make these notes more detailed by expanding explanations and adding examples:",
        shorter: "Summarize these notes into a more concise version while keeping the key points:",
        simpler: "Simplify these notes to make them easier to understand:",
        complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
      };

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `# System Instructions

## Role and Purpose
You are an AI assistant that helps enhance and modify lecture notes. Your goal is to adapt and refine the notes while maintaining their academic value and structured format.

## Key Guidelines
1. Preserve all markdown formatting and hierarchical structure
2. Maintain organized sections (Key Concepts, Formulas, Applications, etc.)
3. Keep consistent formatting for headings, bullet points, and emphasis
4. Adapt content based on the requested enhancement mode while preserving academic accuracy
5. Ensure clear transitions between topics and concepts
6. Use appropriate academic terminology based on the subject matter

📌 Important: Always maintain the structural integrity of the notes while applying the requested modifications.`
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
    } catch (error) {
      console.error("Enhance notes error:", error);
      throw error;
    }
  }
}

export const groqService = new GroqService();