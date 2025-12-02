import { generateSpeech } from '@/lib/elevenlabs-client';

export async function POST(request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await generateSpeech(text, voiceId);

    if (!audioBuffer) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate speech' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(audioBuffer, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('[Text-to-Speech] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
