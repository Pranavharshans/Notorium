import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not configured');
    return NextResponse.json(
      { error: 'Groq API key is not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('Request received, parsing body...');
    const body = await request.json();
    console.log('Parsed request body:', JSON.stringify(body));
    
    const { audioUrl } = body;
    if (!audioUrl) {
      console.error('No audio URL provided in request body:', body);
      return NextResponse.json(
        { error: 'No audio URL provided' },
        { status: 400 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    console.log('Attempting transcription with Groq for URL:', audioUrl);
    const transcription = await groq.audio.transcriptions.create({
      url: audioUrl,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language: "en",
      temperature: 0.0
    } as any);

    console.log('Transcription successful');

    // Store transcription data in Firestore
    const transcriptionData = {
      text: transcription.text,
      audioUrl: audioUrl,
      timestamp: FieldValue.serverTimestamp()
    };

    try {
      // Initialize Firebase Admin if not already initialized
      if (getApps().length === 0) {
        const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
        );

        if (!serviceAccount.project_id) {
          throw new Error('Invalid Firebase service account configuration');
        }

        initializeApp({
          credential: cert(serviceAccount)
        });
      }

      const db = getFirestore();
      const docRef = await db.collection('transcriptions').add(transcriptionData);
      console.log('Transcription data stored with ID: ', docRef.id);
      return NextResponse.json(transcription);
    } catch (e: unknown) {
      console.error("Firestore error:", e);
      return NextResponse.json(
        { 
          error: 'Failed to store transcription', 
          details: e instanceof Error ? e.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Transcription error in API route:', error);
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error. Raw request:', await request.text());
    }
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}