import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import fs from 'fs/promises'; // Import fs/promises for async file operations
import path from 'path'; // Import path module

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
    const audioBlob = formData.get('audio') as Blob; // Keep as Blob

    if (!audioBlob) {
      console.error('No audio file provided in form data');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`Received audio blob - Type: ${audioBlob.type}, Size: ${audioBlob.size} bytes`); // Log blob info

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Construct a File object from the Blob
    const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type || 'audio/webm' });
    console.log(`Constructed File object - Name: ${audioFile.name}, Type: ${audioFile.type}, Size: ${audioFile.size} bytes`); // Log file info

    console.log('Attempting transcription with Groq using File object...');
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile, // Pass the File object
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language: "en",
    });
    console.log('Transcription successful');

    // Create .tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), '.tmp');
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (mkdirError: any) {
      console.error("Error creating .tmp directory:", mkdirError);
      // Consider whether to return an error to the client here
    }

    // Write the transcription text to a file
    const filePath = path.join(tmpDir, 'latest_transcription.txt');
    try {
      await fs.writeFile(filePath, transcription.text, 'utf8');
      console.log(`Transcription saved to ${filePath}`);
    } catch (writeFileError: any) {
      console.error("Error writing transcription to file:", writeFileError);
      // Consider whether to return an error to the client here
    }

    return NextResponse.json(transcription);
  } catch (error: any) {
    console.error('Transcription error in API route:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}