import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';

interface GroqError {
  response?: {
    data: unknown;
    status: number;
    headers: Record<string, string>;
  };
  request?: unknown;
  message?: string | undefined;
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not configured');
    return NextResponse.json(
      { error: 'Groq API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;

    if (!audioBlob) {
      console.error('No audio file provided in form data');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`Received audio blob - Type: ${audioBlob.type}, Size: ${audioBlob.size} bytes`);

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type || 'audio/webm' });
    console.log(`Constructed File object - Name: ${audioFile.name}, Type: ${audioFile.type}, Size: ${audioFile.size} bytes`);

    console.log('Attempting transcription with Groq using File object...');
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language: "en",
    });
    console.log('Transcription successful');

    const tmpDir = path.join(process.cwd(), '.tmp');
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (error) {
      console.error("Error creating .tmp directory:", error instanceof Error ? error.message : 'Unknown error');
    }

    const filePath = path.join(tmpDir, 'latest_transcription.txt');
    try {
      await fs.writeFile(filePath, transcription.text, 'utf8');
      console.log(`Transcription saved to ${filePath}`);
    } catch (error) {
      console.error("Error writing transcription to file:", error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json(transcription);
  } catch (error: unknown) {
    console.error('Transcription error in API route:', error);
    let groqError: GroqError | null = null;

    if (typeof error === 'object' && error !== null) {
      groqError = error as GroqError;
    }
    
    if (groqError?.response) {
      console.error('Error response data:', groqError.response.data);
      console.error('Error response status:', groqError.response.status);
      console.error('Error response headers:', groqError.response.headers);
    } else if (groqError?.request) {
      console.error('Error request:', groqError.request);
    } else if (error instanceof Error) {
      console.error('Error message:', error.message);
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: (groqError?.message) || (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
