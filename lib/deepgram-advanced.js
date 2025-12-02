// Advanced Deepgram Features with Real-time Streaming & AI
import * as Sentry from "@sentry/nextjs";

const DEEPGRAM_BASE_URL = 'https://api.deepgram.com/v1';

// Real-time streaming transcription
export async function createLiveTranscriptionStream(apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
  try {
    const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&punctuate=true&numerals=true`;
    
    const ws = new WebSocket(wsUrl, ['token', apiKey]);

    ws.onopen = () => {
      Sentry.addBreadcrumb({
        message: 'WebSocket connection established',
        category: 'deepgram',
        level: 'info',
      });
    };

    ws.onerror = (error) => {
      Sentry.captureException(error, { tags: { feature: 'websocket_error' } });
    };

    return ws;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'create_stream' } });
    return null;
  }
}

// Advanced transcription with sentiment & intent analysis
export async function transcribeWithAnalysis(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const params = new URLSearchParams({
      model: 'nova-2',
      language: 'en',
      punctuate: 'true',
      numerals: 'true',
      paragraphs: 'true',
      diarize: 'true', // Speaker identification
      detect_language: 'true',
      smart_formatting: 'true',
    });

    const response = await fetch(
      `${DEEPGRAM_BASE_URL}/listen?${params}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    const result = await response.json();

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
    const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0;
    const language = result.results?.channels[0]?.detected_language || 'en';
    const paragraphs = result.results?.channels[0]?.alternatives[0]?.paragraphs || [];
    const words = result.results?.channels[0]?.alternatives[0]?.words || [];

    Sentry.addBreadcrumb({
      message: `Transcription complete: ${transcript.substring(0, 50)}...`,
      category: 'deepgram',
      level: 'info',
      data: {
        confidence: parseFloat((confidence * 100).toFixed(2)),
        language,
        wordCount: words.length,
      },
    });

    // Analyze sentiment from transcript
    const sentiment = analyzeSentiment(transcript);

    return {
      transcript,
      confidence,
      language,
      paragraphs,
      words,
      sentiment,
      success: true,
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'transcribe_advanced' } });
    return {
      transcript: '',
      confidence: 0,
      success: false,
      error: error.message,
    };
  }
}

// Sentiment analysis
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'poor', 'worst'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    positiveCount += (lowerText.match(new RegExp(word, 'g')) || []).length;
  });

  negativeWords.forEach(word => {
    negativeCount += (lowerText.match(new RegExp(word, 'g')) || []).length;
  });

  const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
  const score = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    positiveWords: positiveCount,
    negativeWords: negativeCount,
  };
}

// Prerecorded transcription with speaker diarization
export async function transcribeWithSpeakerDiarization(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(
      `${DEEPGRAM_BASE_URL}/listen?model=nova-2&diarize=true&punctuate=true&language=en`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Diarization error: ${response.status}`);
    }

    const result = await response.json();
    const alternativesData = result.results?.channels[0]?.alternatives[0];

    return {
      transcript: alternativesData?.transcript || '',
      confidence: alternativesData?.confidence || 0,
      speakers: extractSpeakerInfo(alternativesData?.words || []),
      success: true,
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'speaker_diarization' } });
    return { transcript: '', confidence: 0, speakers: [], success: false };
  }
}

// Extract speaker information from words
function extractSpeakerInfo(words) {
  const speakers = new Map();

  words.forEach(word => {
    const speakerId = word.speaker || 0;
    if (!speakers.has(speakerId)) {
      speakers.set(speakerId, []);
    }
    speakers.get(speakerId).push(word.word);
  });

  return Array.from(speakers.entries()).map(([id, words]) => ({
    speaker: id,
    words: words.join(' '),
    wordCount: words.length,
  }));
}

// Get account usage stats
export async function getDeepgramUsage() {
  try {
    const response = await fetch(`${DEEPGRAM_BASE_URL}/usage`, {
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.status}`);
    }

    const data = await response.json();
    
    Sentry.addBreadcrumb({
      message: 'Usage stats retrieved',
      category: 'deepgram',
      level: 'info',
      data: {
        totalRequests: data.total_requests,
        totalHours: data.total_hours,
      },
    });

    return data;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'usage_stats' } });
    return null;
  }
}

// Batch transcription (multiple files)
export async function batchTranscribe(audioBlobs) {
  try {
    const promises = audioBlobs.map(blob => transcribeWithAnalysis(blob));
    const results = await Promise.allSettled(promises);

    Sentry.addBreadcrumb({
      message: `Batch transcription: ${results.length} files`,
      category: 'deepgram',
      level: 'info',
    });

    return results.map((result, i) => ({
      index: i,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null,
    }));
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'batch_transcribe' } });
    return [];
  }
}

// Real-time transcription helper (for microphone input)
export function setupLiveTranscription(onTranscript, onError) {
  try {
    const ws = createLiveTranscriptionStream();

    if (!ws) {
      onError('WebSocket connection failed');
      return null;
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel?.alternatives[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        onTranscript(transcript, isFinal);
      }
    };

    ws.onerror = (error) => {
      Sentry.captureException(error, { tags: { feature: 'live_transcription' } });
      onError(error.message);
    };

    return ws;
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'setup_live_transcription' } });
    onError(error.message);
    return null;
  }
}
