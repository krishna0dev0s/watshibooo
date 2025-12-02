// Advanced TTS API Route with Streaming and Emotion Control
import { generateAdvancedSpeech, generateStreamingSpeech, analyzeAudio } from '@/lib/elevenlabs-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { PerformanceMonitor, BehaviorTracker } = AdvancedSentry;

export async function POST(request) {
  const monitor = PerformanceMonitor.trackTransaction('advanced-tts-api', 'http.request');

  try {
    const body = await request.json();
    const {
      text,
      voiceId = 'EXAVITQu4vr4xnSDxMaL',
      emotion = 'professional',
      useStreaming = true,
      analyzeQuality = true,
    } = body;

    BehaviorTracker.trackUserAction('Advanced TTS API called', {
      emotion,
      textLength: text.length,
      useStreaming,
    });

    // Emotion presets
    const emotionSettings = {
      professional: { stability: 0.7, similarityBoost: 0.8, speakerBoost: false },
      enthusiastic: { stability: 0.3, similarityBoost: 0.9, speakerBoost: true },
      warm: { stability: 0.4, similarityBoost: 0.85, speakerBoost: true },
      neutral: { stability: 0.5, similarityBoost: 0.75, speakerBoost: false },
    };

    const settings = emotionSettings[emotion] || emotionSettings.professional;
    const startTime = Date.now();

    let response;

    // Use streaming for faster response
    if (useStreaming) {
      const streamMonitor = monitor.startChild({
        op: 'streaming-tts',
        description: 'Generating streaming speech',
      });

      response = await generateStreamingSpeech(text, voiceId);
      streamMonitor.finish();
    } else {
      // Use advanced TTS with emotion control
      const advancedMonitor = monitor.startChild({
        op: 'advanced-tts',
        description: 'Generating advanced speech',
      });

      const result = await generateAdvancedSpeech(text, {
        voiceId,
        ...settings,
      });
      response = result;
      advancedMonitor.finish();
    }

    const audioBuffer = await response.arrayBuffer();
    const latency = Date.now() - startTime;

    // Analyze audio quality if requested
    let qualityAnalysis = null;
    if (analyzeQuality) {
      const analysisMonitor = monitor.startChild({
        op: 'audio-analysis',
        description: 'Analyzing audio quality',
      });

      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      qualityAnalysis = await analyzeAudio(audioBlob);
      analysisMonitor.finish();
    }

    BehaviorTracker.trackUserAction('Advanced TTS generated', {
      emotion,
      duration: qualityAnalysis?.duration,
      quality: qualityAnalysis?.quality.level,
      latency,
    });

    return Response.json(
      {
        success: true,
        audio: Buffer.from(audioBuffer).toString('base64'),
        metadata: {
          emotion,
          useStreaming,
          latency,
          quality: qualityAnalysis,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Process-Time': `${latency}ms`,
        },
      }
    );
  } catch (error) {
    BehaviorTracker.trackError('ADVANCED_TTS_ERROR', error.message, {
      textLength: body?.text?.length,
      emotion: body?.emotion,
    });

    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  } finally {
    monitor.end();
  }
}
