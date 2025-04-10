import { GoogleGenAI } from "@google/genai";

export type EnhanceMode = 'detailed' | 'shorter' | 'simpler' | 'complex';
export type LectureCategory = 'programming' | 'mathematics' | 'science' | 'humanities' | 'business' | 'law' | 'medicine' | 'engineering' | 'general';

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

  private getCategorySpecificInstructions(category: LectureCategory): string {
    const baseInstructions = `# System Instructions

## Role and Purpose
You are an advanced AI assistant specializing in processing and summarizing raw lecture transcripts. Your goal is to convert spoken, unstructured text into well-organized, clear, and comprehensive notes that help students understand and retain key concepts.`;

    const categoryInstructions = {
      programming: `
    ## Additional Programming-Specific Instructions
    - Extract and format code snippets using proper syntax highlighting
    - Identify and explain key programming concepts, patterns, and algorithms
    - Include practical, commented code examples (in relevant programming languages)
    - Document API usage and external library references with links
    - Highlight best practices, common mistakes, and debugging tips
    - Include time and space complexity analysis for algorithms
    - Reference official documentation and trusted programming sources
    - When possible, distinguish between pseudo-code and production-ready code`,
      mathematics: `
    ## Additional Mathematics-Specific Instructions
    - Format all mathematical equations and expressions using LaTeX
    - Provide clear definitions of terms, variables, and symbols used
    - Include step-by-step derivations, logical reasoning, and proofs
    - Add example problems with fully worked-out solutions
    - Use consistent units and variable naming throughout
    - Include visual representations (diagrams, graphs, etc.) to aid understanding
    - Reference relevant theorems, axioms, and mathematical properties
    - Highlight real-world applications of the mathematical concepts`,
      science: `
    ## Additional Science-Specific Instructions
    - Use precise scientific terminology and standardized nomenclature
    - Include hypothesis, experimental procedures, and methodologies
    - Clearly document observations, data, and interpretations of results
    - Add labeled diagrams, flowcharts, or illustrations of key concepts
    - Reference relevant scientific theories, models, and laws
    - Include real-world applications and examples from current research
    - Note safety considerations and ethical implications where applicable
    - Use SI units consistently throughout the response`,
      humanities: `
    ## Additional Humanities-Specific Instructions
    - Identify central themes, arguments, and ideas in historical, literary, or philosophical texts
    - Include quotes, citations, and contextual references to support analysis
    - Document differing interpretations and academic perspectives
    - Provide historical, cultural, or societal background where relevant
    - Link themes to contemporary issues or cultural shifts when applicable
    - Reference both primary and secondary sources with proper attribution
    - When relevant, include a chronological timeline or comparative analysis
    - Use accessible yet nuanced language for interpretive clarity`,
      business: `
    ## Additional Business-Specific Instructions
    - Include real-world case studies, market examples, or brand references
    - Provide market analysis, SWOT, PESTLE, or competitor comparisons
    - Include key financial calculations, ratios, or metrics where relevant
    - Explain business models, strategies, and execution plans
    - Add references to industry reports, trends, or benchmarks
    - Include frameworks (e.g., Porter's Five Forces, Business Model Canvas)
    - Discuss risks, mitigation strategies, and regulatory compliance
    - Where helpful, include visual aids like charts, tables, or infographics`,
      law: `
    ## Additional Law-Specific Instructions
    - Reference specific statutes, regulations, and governing bodies
    - Include case law examples and legal precedents
    - Define legal terms, principles, and doctrines with clarity
    - Highlight jurisdictional considerations (e.g., US vs EU law)
    - Discuss procedural requirements, timelines, and documentation
    - Include analysis of opposing legal arguments or outcomes
    - When helpful, format responses similar to briefs or legal memos
    - Reference official sources (e.g., court rulings, law journals)`,
      medicine: `
    ## Additional Medicine-Specific Instructions
    - Use accurate medical terminology with brief explanations for non-specialists
    - Include relevant anatomical, physiological, or pathological concepts
    - Provide diagnostic criteria, treatment protocols, and clinical guidelines
    - Mention drug interactions, side effects, and contraindications
    - Reference ICD, DSM, or other classification systems where applicable
    - Include patient care considerations and ethical dimensions of treatment
    - Add diagrams or flowcharts for clinical workflows or organ systems
    - Cite sources like WHO, CDC, PubMed, or peer-reviewed journals`,
      engineering: `
    ## Additional Engineering-Specific Instructions
    - Include technical specifications, formulas, and design parameters
    - Explain core engineering principles involved (e.g., stress, circuits, mechanics)
    - Provide relevant diagrams, schematics, and system architecture if needed
    - Discuss material selection, design constraints, and optimization methods
    - Include testing methods, validation steps, and safety standards
    - Use appropriate units and follow industry standards (e.g., ISO, IEEE)
    - Reference real-world engineering applications and case studies
    - Where applicable, include cost estimations or feasibility analysis`,
      general: `
    ## Additional General Instructions
    - Use clear, concise, and accessible language throughout
    - Include practical examples, analogies, or case references to aid understanding
    - Define all key terms and concepts, especially technical or abstract ones
    - Incorporate visual aids like tables, flowcharts, or bullet lists where helpful
    - Reference reliable sources or further reading materials
    - Highlight real-world relevance or applications of the topic
    - Maintain a balanced tone—professional but easy to engage with`
    };

    // Combine base instructions with category-specific instructions
    return `${baseInstructions}\n${categoryInstructions[category]}`;
  }

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<string> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
      }
      console.log("Gemini API Key:", apiKey);
      const ai = new GoogleGenAI({ apiKey });
      const categoryInstructions = this.getCategorySpecificInstructions(category);
      const systemInstruction = this.getSystemInstruction();
      const combinedInstructions = `${systemInstruction}\n\n${categoryInstructions}`;
      const geminiInput = {
        model: "gemini-2.0-flash",
        contents: transcript,
        config: {
          systemInstruction: combinedInstructions
        }
      };
      console.log("Complete Gemini input:", {
        systemInstruction: combinedInstructions,
        transcript: transcript
      });
      const response = await ai.models.generateContent(geminiInput);
      return response.text ?? '';
    } catch (error) {
      console.error("Generate notes error:", error);
      throw error;
    }
  }

  private getSystemInstruction(): string {
    const systemInstruction = `# System Instructions

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
Lecture Length	Processing Approach
Short (<5 min)	Generate a brief, high-level summary with key bullet points.
Medium (5-20 min)	Provide a detailed, section-wise breakdown with examples.
Long (20+ min)	Generate comprehensive, textbook-style notes with deep explanations, case studies, and real-world applications.
Ensure summaries maintain logical flow and follow a structured format.

If the transcript lacks coherence, reconstruct the meaning logically.

3️⃣ Generate Well-Structured Notes
Transform the raw transcript into hierarchical bullet points for clarity.

Ensure a logical flow between concepts.

Include the following structured elements:

📖 Key Concepts / Core Ideas
Concept 1: Explanation (e.g., theory, algorithm, law, model, or method)

Concept 2: Explanation

📊 Key Formulas / Code / Diagrams
When applicable, generate diagrams to illustrate concepts. Use Mermaid syntax and enclose the diagram within a \`\`\`mermaid code block.

IMPORTANT: Follow these formatting rules for all Mermaid diagrams:
1. Use consistent 2-space indentation for all lines
2. No extra spaces before node definitions
3. Maintain uniform spacing around arrows and labels
4. Example of correct formatting:
\`\`\`mermaid
graph TD
  A[Start] --> B[Step]
  B --> C[End]
\`\`\`

- For flowcharts (processes, algorithms):
\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action 1]
  B -->|No| D[Action 2]
\`\`\`

- For swimlane diagrams (process flow across departments or roles):
  For swim lane diagrams, follow these strict guidelines:
  1. Each swim lane must be defined using "subgraph" keyword with a clear, descriptive name
  2. Keep all related activities within their respective swim lanes
  3. For transitions between swim lanes:
     - Create distinct nodes in each lane (e.g., 'Send_to_Carrier' in lane 1, 'Receive_from_Warehouse' in lane 2)
     - Use clear node IDs that don't conflict across lanes
     - Connect the transition nodes with appropriate arrows
  4. Use consistent naming and arrow styles throughout the diagram
  
  Example of a properly structured swim lane diagram:
\`\`\`mermaid
graph LR
  subgraph Warehouse
    A[Start] --> B{Pick Order}
    B -- Yes --> C[Pack Order]
    B -- No --> D[Repick Order]
    D --> B
    C --> E[Send_to_Carrier]
  end

  subgraph Carrier
    F[Receive_from_Warehouse] --> G[Deliver Order]
    G --> H[End]
  end
  
  E --> F
\`\`\`

- For sequence diagrams (interactions, workflows):
\`\`\`mermaid
sequenceDiagram
  participant A as System A
  participant B as System B
  A->>B: Action
  B-->>A: Response
\`\`\`

- For class diagrams (relationships, inheritance):
\`\`\`mermaid
classDiagram
  Class1 <|-- Class2
  Class1 : +method()
  Class1 : -attribute
\`\`\`

If no diagram is suitable, provide relevant formulas or code snippets.

plaintext
Copy
Edit
Formula: E = mc^2
Explanation of how it applies in physics.

💡 Real-World Applications
Application 1: [Example scenario]

Application 2: [Practical use case]

📚 Case Studies (For Longer Lectures)
Case Study 1: [Detailed explanation]

Case Study 2: [Historical/legal/business reference]

🏆 Key Takeaways
[Main insights students should remember]

📎 Additional Notes
- Use this section for domain-specific elements like legal procedures, ethical issues, business frameworks, etc.

4️⃣ Enhancing Clarity, Readability & Depth
Fix incomplete sentences and reconstruct broken phrases logically.
Only include sections (e.g., Case Studies, Formulas, Real-World Applications) if they are relevant to the lecture's content.

Remove repetition while preserving key points.

Simplify overly complex explanations for better understanding.

Use Markdown formatting for readability:

Formatting Type	Usage
#	Main Title
##	Section Heading
###	Subsection Heading
**bold**	Highlight important terms
*italics*	Emphasize words or phrases
\`Code Blocks\`	Display formulas, key terms, or code
---	Separate sections for better readability
Use tables when comparing concepts or organizing structured data.

📌 Important: Always include a space after # in headers

# 📌 Lecture Topic: [Topic Name]

## 📝 Summary
- Key point 1
- Key point 2
- Key point 3

---

## 📖 Key Concepts / Core Ideas
- **Concept 1:** Explanation (e.g., theory, algorithm, law, model, or method)
- **Concept 2:** Explanation

---

## 📊 Key Formulas / Code / Diagrams
plaintext
Formula or Code: ...
Explanation or use case

💡 Real-World Applications
Application 1: [Example scenario]
Application 2: [Practical use case]

📚 Case Studies (For Longer Lectures)
Case Study 1: [Detailed explanation]
Case Study 2: [Historical/legal/business reference]

🏆 Key Takeaways
[Main insights students should remember]

📎 Additional Notes
- For domain-specific elements like legal procedures, ethical issues, business frameworks, etc.

🔹 Additional Enhancements for Long Lectures:
FAQs with possible questions and answers.

Memory tips or mnemonics for better retention.

Cheat Sheet summary at the end for quick revision.

do not include staments in the begining of the output like "Here is a summary of the lecture" or "The following are the key points". Instead, directly present the content in a structured format.`;
    return systemInstruction;
  }
  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    try {
      const instructions = {
        detailed: "Make these notes more detailed by expanding explanations and adding examples:",
        shorter: "Summarize these notes into a more concise version while keeping the key points:",
        simpler: "Simplify these notes to make them easier to understand:",
        complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
      };

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${instructions[mode]}\n\n${notes}`,
      });

      return response.text ?? '';
    } catch (error) {
      console.error("Enhance notes error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
