import { transcribeAudio } from '@/lib/deepgram-client';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio');

    if (!audioBlob) {
      return new Response(
        JSON.stringify({ error: 'No audio provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await transcribeAudio(audioBlob);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          transcript: '',
          confidence: 0,
          error: result.error,
          usingFallback: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        transcript: result.transcript,
        confidence: result.confidence,
        success: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Transcribe] Error:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        transcript: '',
        confidence: 0,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
