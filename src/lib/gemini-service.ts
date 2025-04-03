import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  async processTask(data: any): Promise<any> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Failed to process Gemini task: ${errorDetail}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Gemini Service error:", error);
      throw error;
    }
  }

  async generateNotesFromTranscript(transcript: string): Promise<string> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
      }
      console.log("Gemini API Key:", apiKey);
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: transcript,
        config: {
          systemInstruction: `You are an advanced AI assistant specialized in processing and summarizing college lectures. Your task is to convert lecture transcripts into detailed summaries and well-structured notes that help students grasp key concepts efficiently.

Instructions:

Understand Context:
- The transcript is from a college lecture.
- It may contain technical jargon, informal speech, or repetition.
- Ensure accuracy while improving readability.

Generate a Detailed Summary:
- Identify the main topic and key concepts of the lecture.
- Summarize each major section logically and concisely.
- Retain important examples, equations, and definitions.
- Ensure the summary is clear, structured, and easy to read.

Generate Well-Structured Notes:
- Convert raw information into organized bullet points.
- Use headings and subheadings to group related ideas.
- Highlight key points, formulas, and practical applications.
- Simplify complex explanations where possible.

Enhance Clarity & Readability:
- Remove filler words, redundant phrases, and unnecessary repetitions.
- Convert long paragraphs into shorter, digestible sections.
- Use simple language while maintaining academic rigor.

Formatting Guidelines:
- Use Markdown for structure.
- Use **larger fonts for titles** (e.g., Markdown "# " for headers).
- Make **important text bold**.
- Use *italics* for definitions or emphasis.
- Utilize code blocks for formulas or key terms.
- Arrange content with clear headings and subheadings for readability.

Example Output Format:

# 📌 Lecture Topic: [Topic Name]

## 📝 Summary:
[Concise overview of key points]

## 📖 Key Concepts:
- **Term 1:** Explanation
- **Term 2:** Explanation

## 📊 Important Formulas & Diagrams:
- Formula: \`E = mc^2\` (Explanation)

## 💡 Key Takeaways:
[Actionable insights from the lecture]`
        }
      });
      return response.text ?? '';
    } catch (error) {
      console.error("Generate notes error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();