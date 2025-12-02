// ElevenLabs Text-to-Speech Client
export async function generateSpeech(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return audioBuffer;
  } catch (error) {
    console.error('ElevenLabs error:', error);
    // Fallback to browser speech synthesis
    return null;
  }
}

// Get available voices from ElevenLabs
export async function getElevenLabsVoices() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Failed to get ElevenLabs voices:', error);
    return [];
  }
}

// Play audio from ElevenLabs
export function playAudio(audioBuffer) {
  if (!audioBuffer) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createBufferSource();

  audioContext.decodeAudioData(audioBuffer, (buffer) => {
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  });
}
