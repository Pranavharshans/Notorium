import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { FieldValue } from 'firebase-admin/firestore';
import { auth, db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { isValidAudioUrl } from '@/lib/url-validator';

export async function POST(request: Request) {
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

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

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

    // Validate audio URL
    if (!isValidAudioUrl(audioUrl)) {
      console.error('Invalid audio URL:', audioUrl);
      return NextResponse.json(
        { error: 'Invalid audio URL' },
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

    // Store transcription data in Firestore with user ID
    const transcriptionData = {
      text: transcription.text,
      audioUrl: audioUrl,
      userId: decodedClaims.uid,
      timestamp: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('transcriptions').add(transcriptionData);
    console.log('Transcription data stored with ID: ', docRef.id);
    
    return NextResponse.json(transcription);
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