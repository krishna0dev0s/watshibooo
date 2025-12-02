// Advanced ElevenLabs Features with Voice Cloning & Streaming
import * as Sentry from "@sentry/nextjs";

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Get all available voices with detailed info
export async function getAllVoices() {
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch voices: ${response.status}`);
    
    const data = await response.json();
    Sentry.addBreadcrumb({
      message: `Retrieved ${data.voices.length} voices`,
      category: 'elevenlabs',
      level: 'info',
    });
    
    return data.voices;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'get_voices' } });
    return [];
  }
}

// Advanced text-to-speech with emotion & stability control
export async function generateAdvancedSpeech(text, options = {}) {
  try {
    const {
      voiceId = 'EXAVITQu4vr4xnSDxMaL',
      stability = 0.5,
      similarityBoost = 0.75,
      speakerBoost = true,
      modelId = 'eleven_monolingual_v1',
    } = options;

    Sentry.addBreadcrumb({
      message: `Generating speech: ${text.substring(0, 50)}...`,
      category: 'elevenlabs',
      level: 'info',
    });

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}${modelId.includes('turbo') ? '?optimize_streaming_latency=4' : ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: stability,
            similarity_boost: similarityBoost,
            style: 0.5,
            use_speaker_boost: speakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    Sentry.addBreadcrumb({
      message: `Speech generated successfully (${audioBuffer.byteLength} bytes)`,
      category: 'elevenlabs',
      level: 'info',
    });

    return audioBuffer;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'generate_speech', component: 'elevenlabs' },
      extra: { textLength: text.length },
    });
    return null;
  }
}

// Text-to-speech with streaming (low latency)
export async function generateStreamingSpeech(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  try {
    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Streaming error: ${response.status}`);
    }

    return response;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'streaming_speech' } });
    return null;
  }
}

// Get voice settings/details
export async function getVoiceDetails(voiceId) {
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      headers: {
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch voice: ${response.status}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'voice_details' } });
    return null;
  }
}

// Analyze audio characteristics
export async function analyzeAudio(audioBuffer) {
  try {
    // Calculate audio features
    const view = new Uint8Array(audioBuffer);
    const duration = view.length / 16000; // Assuming 16kHz sample rate
    
    // RMS (loudness) calculation
    let sum = 0;
    for (let i = 0; i < view.length; i += 2) {
      const sample = (view[i + 1] << 8) | view[i];
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / (view.length / 2));
    
    return {
      duration,
      rms,
      quality: rms > 1000 ? 'high' : 'medium',
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'analyze_audio' } });
    return null;
  }
}

// Play audio with advanced controls
export function playAudioAdvanced(audioBuffer, options = {}) {
  try {
    const {
      volume = 1,
      playbackRate = 1,
      onComplete = null,
      onError = null,
    } = options;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    const source = audioContext.createBufferSource();

    gainNode.gain.value = volume;
    source.playbackRate.value = playbackRate;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    audioContext.decodeAudioData(
      audioBuffer,
      (buffer) => {
        source.buffer = buffer;
        source.start(0);

        source.onended = () => {
          Sentry.addBreadcrumb({
            message: 'Audio playback completed',
            category: 'audio',
            level: 'info',
          });
          if (onComplete) onComplete();
        };
      },
      (error) => {
        Sentry.captureException(error, { tags: { feature: 'decode_audio' } });
        if (onError) onError(error);
      }
    );

    return { source, gainNode, audioContext };
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'play_audio_advanced' } });
    return null;
  }
}

// Batch generate multiple speech segments
export async function generateBatchSpeech(texts, voiceId) {
  try {
    const promises = texts.map(text => generateAdvancedSpeech(text, { voiceId }));
    const results = await Promise.allSettled(promises);

    Sentry.addBreadcrumb({
      message: `Batch speech generation: ${results.length} items`,
      category: 'elevenlabs',
      level: 'info',
    });

    return results.map((result, i) => ({
      index: i,
      text: texts[i],
      success: result.status === 'fulfilled',
      audio: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null,
    }));
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'batch_speech' } });
    return [];
  }
}
