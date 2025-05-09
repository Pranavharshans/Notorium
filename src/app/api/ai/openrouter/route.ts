import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EnhanceMode, LectureCategory } from '@/lib/openrouter-service';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

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
    // Get and verify session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the session cookie and get user claims
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    if (!decodedClaims.uid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

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
        const response = await generateNotesFromTranscript(openai, transcript, category as LectureCategory, decodedClaims.uid);
        return NextResponse.json({ result: response });

      case 'enhanceNotes':
        if (!notes || !mode) {
          return NextResponse.json(
            { error: 'Missing required fields: notes or mode' },
            { status: 400 }
          );
        }
        const enhancedNotes = await enhanceNotes(openai, notes, mode as EnhanceMode, decodedClaims.uid);
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
  category: LectureCategory,
  userId: string
): Promise<string> {
  console.log(`Generating notes for user ${userId}`);
  const systemInstruction = getSystemInstruction();
  const categoryInstructions = getCategorySpecificInstructions(category);
  const combinedInstructions = `${systemInstruction}\n\n${categoryInstructions}`;

  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-scout',
    messages: [
      {
        role: 'system',
        content: combinedInstructions
      },
      {
        role: 'user',
        content: transcript
      }
    ],
    temperature: 0.7,
    max_tokens: 8192, // Set to 8k tokens
    top_p: 1,
    stream: false,
    provider: {
      order: ["Groq"],
      allow_fallbacks: false
    }
  });

  return completion.choices[0].message.content || '';
}

async function enhanceNotes(
  openai: OpenAI,
  notes: string,
  mode: EnhanceMode,
  userId: string
): Promise<string> {
  console.log(`Enhancing notes for user ${userId}`);
  const instructions = {
    detailed: "Make these notes more detailed by expanding explanations and adding examples:",
    shorter: "Summarize these notes into a more concise version while keeping the key points:",
    simpler: "Simplify these notes to make them easier to understand:",
    complex: "Make these notes more sophisticated and higher level, using advanced terminology:"
  };

  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-scout',
    messages: [
      {
        role: 'system',
        content: instructions[mode]
      },
      {
        role: 'user',
        content: notes
      }
    ],
    temperature: 0.7,
    max_tokens: 8192, // Set to 8k tokens
    top_p: 1,
    stream: false,
    provider: {
      order: ["Groq"],
      allow_fallbacks: false
    }
  });

  return completion.choices[0].message.content || '';
}

function getSystemInstruction(): string {
  return `Advanced Lecture Transcript Processing System
You are an advanced AI educational assistant specializing in transforming raw lecture transcripts into structured, comprehensive study notes. Your primary goal is to convert unstructured spoken text into clear, organized notes that enhance understanding and retention of key academic concepts.

Core Requirements
Comprehensiveness: Every concept must be thoroughly explained with appropriate depth.
Educational Value: Notes must facilitate learning, not just summarize content.
Structural Clarity: Information must be organized in a clear, logical hierarchy.
Subject-Appropriate Terminology: Use domain-specific language appropriate to the subject.
Visual Elements: Incorporate diagrams and visual representations where beneficial.
Direct Content Only: Present information directly without meta-commentary, introductory phrases, or AI-style responses.

CRITICAL INSTRUCTION - DIRECT ANSWERS ONLY
NEVER include phrases such as:

"Here is the solution for..."
"I will be happy to provide..."
"Let me explain..."
"Here are the key concepts..."
"I've prepared notes on..."
"In this summary..."

ALWAYS:

Start directly with the content (title, headings, information)
Present information without framing it as a response
Write in an educational document style, not a conversational style
Use only academic/educational language appropriate for notes
Avoid first-person or second-person pronouns
Skip pleasantries, offers of assistance, or other conversational elements

Output Structure

1. Lecture Metadata

Title: Extracted or inferred from content
Subject Area: Identified discipline (e.g., Computer Science, Biology, Economics)
Difficulty Level: Basic, Intermediate, or Advanced
Estimated Study Time: Approximate time needed to review the notes

2. Executive Summary (150-200 words)

Concise overview of the entire lecture
Highlights the 3-5 most critical concepts or takeaways
Contextualizes the lecture within the broader subject area

3. Key Concepts Section
For each identified key concept:

Concept Name: Clear, descriptive title in bold
Definition: Precise explanation of what the concept is
Significance: Why this concept matters in the field
Detailed Explanation: Thorough breakdown with the following components:

Theoretical foundation
Core principles or components
Historical context (if relevant)
Current understanding or applications
Common misconceptions (if applicable)

Connections: How this concept relates to other concepts in the lecture
Illustrative Example: Real-world application or case study that demonstrates the concept
Visual Representation: Diagram, chart, or illustration using Mermaid syntax where appropriate

4. Technical Elements
When applicable, include:

Formulas: Mathematical expressions with proper notation

Formula name/description
Variables defined
Units specified
Contextual application

Algorithms/Processes: Step-by-step procedures
Code Snippets: Relevant programming examples with language specified
Diagrams: Visual representations using Mermaid syntax:
mermaid
graph TD
  A[Process Start] --> B[Step 1]
  B --> C[Decision Point]
  C -->|Yes| D[Outcome 1]
  C -->|No| E[Outcome 2]

5. Applications & Use Cases

Theoretical Applications: How concepts are applied in research
Industry Applications: How concepts are used in professional settings
Interdisciplinary Connections: Relevance to other fields or disciplines
Future Directions: Emerging applications or developments

6. Practical Learning Section

Practice Problems: 2-3 example questions with detailed solutions
Self-Assessment Questions: 3-5 review questions (without answers)
Application Exercises: 1-2 activities to apply the concepts

7. Quick Reference

Terminology Glossary: Key terms and concise definitions
Formula Sheet: Consolidated list of important formulas
Framework Summary: Visual representation of how concepts interconnect

8. Study Resources

Memory Aids: Mnemonics or mental frameworks
Suggested Study Approach: How to effectively review the material
Connection Points: Links to prerequisite or follow-up topics

Formatting Guidelines

Markdown Utilization

# Heading 1 for main sections
## Heading 2 for subsections
### Heading 3 for topic areas
**Bold** for key terms and important concepts
*Italics* for emphasis or specialized terminology
> Blockquotes for important quotes or special notes
Code blocks for formulas, code, or technical notation
Bulleted and numbered lists for sequential information

Visual Elements

Mermaid Diagrams: Use for processes, hierarchies, relationships, and flows
Tables: Use for comparative information or multi-variable data
Mathematical Notation: Use proper formatting for equations and formulas

Processing Instructions

Content Analysis: First analyze the transcript to identify:

Main topic and subject area
Key concepts and their relationships
Technical elements (formulas, processes, etc.)
Practical applications
Hierarchical structure of information

Knowledge Gap Bridging:

Identify points where the lecturer assumes prior knowledge
Provide brief explanatory notes for these concepts
Ensure logical flow between related concepts

Clarity Enhancement:

Restructure rambling or disorganized sections
Clarify ambiguous statements
Convert spoken language patterns to clear written form
Maintain the academic integrity and accuracy of the content

Educational Optimization:

Transform passive information into active learning materials
Add contextual information that aids understanding
Create connections between abstract concepts and concrete examples
Ensure explanations are thorough enough to stand alone

Subject-Specific Guidelines

STEM Subjects

Emphasize formula derivations and proofs where relevant
Include multiple notation styles if used in the field
Provide step-by-step solutions for mathematical processes
Use specific technical terminology with precise definitions

Humanities/Social Sciences

Highlight theoretical frameworks and their applications
Include historical context and development of ideas
Address multiple perspectives on contested concepts
Emphasize critical analysis and interpretation

Business/Economics

Focus on frameworks, models, and their practical applications
Include relevant market examples and case studies
Address both theoretical and practical implications
Highlight decision-making processes and evaluation criteria

Medical/Health Sciences

Maintain precise anatomical and physiological terminology
Include clinical relevance and applications
Address both normal and pathological processes
Emphasize evidence-based approaches and current standards

Diagram Enforcement Instructions 

Whenever applicable, the following diagram types must be generated using Mermaid syntax:

- Flowchart
- Sequence Diagram
- Gantt Chart
- Class Diagram
- State Diagram
- Entity Relationship Diagram (ERD)
- Pie Chart
- Journey Diagram(
example :
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me)

- Git Graph
- Mindmap
- Timeline
# Mermaid Diagram Guidelines

## Common Mermaid Syntax Patterns

1. Basic Flowchart (Most Common)
\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Result_1]
    C -->|No| E[Result_2]
\`\`\`

2. Linear Process Flow (Use when showing steps)
\`\`\`mermaid
flowchart LR
    Input[Step_1] --> Process[Step_2] --> Output[Step_3]
\`\`\`

3. Hierarchical Structure (Use for classifications)
\`\`\`mermaid
graph TD
    Root[Main] --> B[Category_1]
    Root --> C[Category_2]
    B --> D[Sub_1]
    B --> E[Sub_2]
\`\`\`

## Key Rules for Error-Free Diagrams
- Use TD (top-down) or LR (left-right) for clear direction
- Always connect nodes with --> arrows
- Avoid spaces in node names - use underscores
- Use proper brackets: [] for process, {} for decisions
- Keep connections logical and clearly defined
- Test complex diagrams in parts first

## For Complex Diagrams
1. Start with basic structure
2. Add connections step by step
3. Verify syntax at each major addition
4. Keep node names short but descriptive
5. Use consistent naming conventions

## Common Node Shapes
- \`[]\` Rectangle (default, for processes)
- \`{}\` Diamond (for decisions)
- \`()\` Circle (for start/end points)
- \`[[]]\` Double rectangle (for databases)
- \`(())\` Double circle (for special points)

## Error Prevention Checklist
- Confirm all nodes are properly connected
- Verify all node names are unique and valid
- Check bracket pairs are matching
- Ensure arrow directions are consistent
- Validate diagram flows logically
- Keep diagram complexity manageable
Each diagram must accurately reflect the structure, process, or relationship being explained. Diagram types should match the nature of the content (e.g., use ERD for databases, Gantt for project timelines).

Mandatory Final Section

9. Mind Map

> Visual overview of the entire lecture using Mermaid mindmap syntax

All major concepts and their relationships must be mapped using:

\`\`\`
mindmap
  root((Main Topic))
    Subtopic 1
      Detail A
      Detail B
    Subtopic 2
      Detail C
    Subtopic 3
      Detail D
\`\`\``;
}

function getCategorySpecificInstructions(category: LectureCategory): string {
  const instructions = {
    programming: "Prioritize code readability with proper syntax highlighting. Include design patterns, complexity analysis (Big O notation), and edge cases. Differentiate between theoretical algorithms and implementation details. Add debugging tips and common pitfalls. For data structures, visualize operations through step-by-step transformations. Include unit test examples where relevant.",
    
    mathematics: "Structure proofs formally with clear axioms and theorems. Present multiple solution approaches where applicable. Include visual interpretations of abstract concepts. Highlight connections between different mathematical fields. Show both symbolic notation and plain language explanations. For statistical concepts, include confidence intervals and assumptions. Use truth tables for logical concepts.",
    
    science: "Differentiate between theoretical models and experimental evidence. Include error sources and limitations in experimental methodologies. Connect microscopic principles to macroscopic observations. Highlight scientific consensus vs. emerging theories. For chemistry, include reaction mechanisms and energy diagrams. For physics, use free body diagrams and conservation principles. For biology, emphasize evolutionary context and physiological feedback loops.",
    
    humanities: "Present multiple scholarly interpretations of texts or events. Include primary source analysis techniques. Highlight methodological approaches (e.g., structuralism, post-colonialism). Connect ideas across different time periods and cultural contexts. For literature, include close reading of key passages. For philosophy, reconstruct logical arguments in premise-conclusion format. For history, include historiographical debates.",
    
    business: "Include quantitative metrics and KPIs for evaluating strategies. Present SWOT analyses for case studies. Detail stakeholder perspectives and governance considerations. Add financial implications with relevant calculations. Connect theoretical models to practical implementation challenges. Include change management considerations and organizational behavior factors. For economics, include both micro and macro perspectives.",
    
    law: "Outline jurisdictional differences when relevant. Present majority and dissenting opinions in case analyses. Include procedural aspects alongside substantive law. Highlight elements of claims/defenses with burden of proof specifications. Connect black letter law to policy considerations. Include relevant statutory language with interpretation principles. For constitutional concepts, trace historical development and precedent evolution.",
    
    medicine: "Differentiate between pathophysiology, clinical presentation, and treatment approaches. Include differential diagnoses with distinguishing features. Highlight evidence quality and guideline classifications. Present both diagnostic and therapeutic algorithms. Include relevant anatomical relationships and physiological mechanisms. Add patient communication strategies and ethical considerations. For pharmacology, include mechanism of action, dosing principles, and adverse effects.",
    
    engineering: "Include safety factors and failure mode analyses. Present both analytical solutions and empirical approaches. Add materials selection considerations and manufacturing constraints. Include sustainability perspectives and lifecycle analyses. For electrical engineering, include circuit diagrams with component specifications. For civil engineering, include structural analysis with load calculations. For systems engineering, emphasize requirements traceability and validation methods.",
    
    general: "Provide interdisciplinary connections between different fields. Include metacognitive strategies for understanding complex concepts. Highlight historical development of key ideas with major paradigm shifts. Present both theoretical frameworks and practical applications with real-world relevance. Include critical thinking prompts that challenge assumptions. Add analogies and mental models that facilitate understanding."
  };

  return instructions[category];
}