// Advanced Transcription API Route with Sentiment Analysis & Speaker Diarization
import { transcribeWithAnalysis, transcribeWithSpeakerDiarization } from '@/lib/deepgram-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { PerformanceMonitor, BehaviorTracker } = AdvancedSentry;

export async function POST(request) {
  const monitor = PerformanceMonitor.trackTransaction('advanced-transcribe-api', 'http.request');

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const options = JSON.parse(formData.get('options') || '{}');

    const {
      withSentiment = true,
      withSpeakerDiarization = false,
      language = 'en',
    } = options;

    BehaviorTracker.trackUserAction('Advanced Transcription API called', {
      withSentiment,
      withSpeakerDiarization,
      language,
      audioSize: audioFile.size,
    });

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    });

    let result;
    const startTime = Date.now();

    if (withSpeakerDiarization) {
      // Use speaker diarization for multi-speaker interviews
      const diarizationMonitor = monitor.startChild({
        op: 'speaker-diarization',
        description: 'Identifying speakers',
      });

      result = await transcribeWithSpeakerDiarization(audioBlob);
      diarizationMonitor.finish();
    } else if (withSentiment) {
      // Use sentiment analysis
      const sentimentMonitor = monitor.startChild({
        op: 'sentiment-analysis',
        description: 'Analyzing sentiment',
      });

      result = await transcribeWithAnalysis(audioBlob);
      sentimentMonitor.finish();
    }

    const latency = Date.now() - startTime;

    // Process speaker results if available
    let speakerAnalysis = null;
    if (result.speakers) {
      const speakers = result.speakers.map(s => ({
        speaker: s.speaker,
        name: s.name,
        segmentCount: s.segments.length,
        totalDuration: s.segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0),
        segments: s.segments.slice(0, 5), // Return first 5 segments
      }));

      speakerAnalysis = {
        totalSpeakers: speakers.length,
        speakers,
        dominantSpeaker: speakers.reduce((a, b) => 
          a.totalDuration > b.totalDuration ? a : b
        ),
      };
    }

    // Process sentiment results if available
    let sentimentAnalysis = null;
    if (result.sentiment) {
      sentimentAnalysis = {
        overall: result.sentiment.sentiment,
        score: result.sentiment.score,
        confidence: result.confidence,
        wordAnalysis: {
          positive: result.sentiment.analysis?.positive || [],
          negative: result.sentiment.analysis?.negative || [],
          neutral: result.sentiment.analysis?.neutral || [],
        },
      };
    }

    BehaviorTracker.trackUserAction('Advanced Transcription completed', {
      confidence: result.confidence,
      sentiment: result.sentiment?.sentiment,
      speakers: speakerAnalysis?.totalSpeakers,
      latency,
    });

    return Response.json(
      {
        success: true,
        transcript: result.transcript,
        confidence: result.confidence,
        metadata: {
          latency,
          audioSize: audioFile.size,
          sentiment: sentimentAnalysis,
          speakers: speakerAnalysis,
          words: result.words?.slice(0, 10), // Return first 10 words
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Process-Time': `${latency}ms`,
          'X-Confidence': result.confidence.toString(),
        },
      }
    );
  } catch (error) {
    BehaviorTracker.trackError('ADVANCED_TRANSCRIBE_ERROR', error.message, {
      withSentiment: options?.withSentiment,
      withSpeakerDiarization: options?.withSpeakerDiarization,
    });

    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  } finally {
    monitor.end();
  }
}
