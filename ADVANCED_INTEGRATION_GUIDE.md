# Advanced Features Integration Guide

## Overview

This guide shows how to integrate and use the three advanced feature libraries:
- **elevenlabs-advanced.js** - Professional voice with streaming, emotion control, batch processing
- **deepgram-advanced.js** - Real-time transcription with sentiment analysis & speaker tracking
- **sentry-advanced.js** - Comprehensive monitoring with performance metrics & interview analytics

---

## 1. ElevenLabs Advanced Features

### 1.1 Streaming Speech Generation (Low-Latency TTS)

```javascript
import { generateStreamingSpeech, playAudioAdvanced } from '@/lib/elevenlabs-advanced';

// Stream speech for immediate playback (faster than standard TTS)
const streamResponse = await generateStreamingSpeech(
  "Tell me about your experience with React.",
  "EXAVITQu4vr4xnSDxMaL" // voice ID
);

// Convert to audio buffer and play
const audioBuffer = await streamResponse.arrayBuffer();
playAudioAdvanced(audioBuffer, {
  volume: 0.8,
  playbackRate: 1.0,
  onComplete: () => console.log('Speech finished')
});
```

**Benefits:**
- Lower latency (streaming vs buffering entire response)
- Immediate playback while still receiving audio
- Professional quality voice

### 1.2 Advanced Speech with Emotion Control

```javascript
import { generateAdvancedSpeech } from '@/lib/elevenlabs-advanced';

// Generate speech with emotion parameters
const response = await generateAdvancedSpeech(
  "Congratulations! You did amazing!",
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    stability: 0.5,        // Lower = more expressive (0-1)
    similarityBoost: 0.8,  // Higher = more like original voice (0-1)
    speakerBoost: true,    // Amplify voice characteristics
  }
);

// Use the generated audio
const audioBlob = await response.blob();
```

**Emotion Presets:**
- **Enthusiastic**: stability=0.3, similarityBoost=0.9, speakerBoost=true
- **Professional**: stability=0.7, similarityBoost=0.8, speakerBoost=false
- **Warm**: stability=0.4, similarityBoost=0.85, speakerBoost=true

### 1.3 Batch Speech Generation

```javascript
import { generateBatchSpeech } from '@/lib/elevenlabs-advanced';

// Generate multiple speeches in parallel
const responses = await generateBatchSpeech([
  { text: "Welcome to the interview", voiceId: "voice1" },
  { text: "Let's start with your background", voiceId: "voice1" },
  { text: "Great! Next question", voiceId: "voice1" },
]);

// responses = [
//   { success: true, audioBlob, duration: 2100 },
//   { success: true, audioBlob, duration: 1800 },
//   { success: true, audioBlob, duration: 1200 },
// ]
```

**Use Cases:**
- Pre-generate interview questions
- Create question variants
- Batch process in background

### 1.4 Audio Analysis

```javascript
import { analyzeAudio } from '@/lib/elevenlabs-advanced';

const audioBlob = /* ... */;
const analysis = await analyzeAudio(audioBlob);

// Result:
// {
//   duration: 2450,
//   rms: 0.65,
//   peakAmplitude: 0.92,
//   quality: {
//     score: 0.88,
//     level: 'high'
//   }
// }

if (analysis.quality.level === 'low') {
  console.warn('Audio quality might be degraded');
}
```

---

## 2. Deepgram Advanced Features

### 2.1 Real-Time Speech Transcription with Analysis

```javascript
import { transcribeWithAnalysis } from '@/lib/deepgram-advanced';

const audioBlob = /* audio from recording */;
const result = await transcribeWithAnalysis(audioBlob);

// Result includes:
// {
//   success: true,
//   transcript: "I have 5 years of React experience",
//   confidence: 0.95,
//   sentiment: {
//     sentiment: 'positive',
//     score: 0.78,
//     analysis: {
//       positive: ['experience'],
//       negative: [],
//       neutral: ['5', 'years']
//     }
//   },
//   words: [/* detailed word-level data */]
// }

console.log(`Confidence: ${result.confidence * 100}%`);
console.log(`Sentiment: ${result.sentiment.sentiment}`);
```

**Confidence Interpretation:**
- > 0.95: Excellent transcription
- 0.80-0.95: Good transcription
- 0.60-0.80: Fair transcription (review recommended)
- < 0.60: Poor transcription (retake suggested)

### 2.2 Speaker Diarization (Multi-Speaker Tracking)

```javascript
import { transcribeWithSpeakerDiarization } from '@/lib/deepgram-advanced';

// For interviews with multiple participants
const result = await transcribeWithSpeakerDiarization(audioBlob);

// Result includes speaker identification:
// {
//   speakers: [
//     {
//       speaker: 0,
//       name: 'Speaker 1',
//       segments: [
//         { text: "Tell me about yourself", startTime: 0, endTime: 3000 }
//       ]
//     },
//     {
//       speaker: 1,
//       name: 'Speaker 2',
//       segments: [
//         { text: "I have 5 years of experience", startTime: 3500, endTime: 6200 }
//       ]
//     }
//   ],
//   transcript: "Speaker 1: Tell me about yourself...",
//   confidence: 0.92
// }
```

**Use Cases:**
- Track interviewer vs candidate responses
- Measure talk time balance
- Analyze turn-taking patterns

### 2.3 Real-Time WebSocket Streaming

```javascript
import { createLiveTranscriptionStream } from '@/lib/deepgram-advanced';

// Connect to live transcription
const connection = await createLiveTranscriptionStream();

connection.on('message', (event) => {
  const transcript = event.channel.alternatives[0].transcript;
  if (event.is_final) {
    console.log('Final:', transcript);
  } else {
    console.log('Interim:', transcript);
  }
});

// Stop when done
connection.removeAllListeners();
await connection.close();
```

**Real-Time Features:**
- Interim results (as speaking)
- Final results (after speaking pause)
- Word-level timing information
- Immediate feedback capability

### 2.4 Batch Transcription

```javascript
import { batchTranscribe } from '@/lib/deepgram-advanced';

const audioBlobs = [blob1, blob2, blob3];
const results = await batchTranscribe(audioBlobs);

// Process multiple recordings in parallel
// results = [
//   { success: true, transcript: "...", confidence: 0.94 },
//   { success: true, transcript: "...", confidence: 0.91 },
//   { success: true, transcript: "...", confidence: 0.89 }
// ]
```

---

## 3. Sentry Advanced Monitoring

### 3.1 Performance Transaction Tracking

```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { PerformanceMonitor } = AdvancedSentry;

// Track specific operations
const monitor = PerformanceMonitor.trackTransaction('api-call', 'http');

try {
  const response = await fetch('/api/interview/analyze');
  // ... process response
} finally {
  monitor.end(); // Automatically records duration
}

// Or with custom spans
const txn = PerformanceMonitor.startTransaction('interview-recording', 'user-action');
const span1 = txn.startChild({ op: 'recording', description: 'Recording audio' });
// ... recording logic
span1.finish();
const span2 = txn.startChild({ op: 'transcription', description: 'Transcribing' });
// ... transcription logic
span2.finish();
txn.finish();
```

### 3.2 Interview Metrics Collection

```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics } = AdvancedSentry;

// Initialize metrics for interview session
const metrics = new InterviewMetrics(`interview-${candidateId}`);

// Track interview phases
metrics.trackPhaseStart('greeting');
// ... conduct greeting phase
metrics.trackPhaseEnd();

metrics.trackPhaseStart('personal');
// ... conduct personal info phase
metrics.trackPhaseEnd();

metrics.trackPhaseStart('technical-questions');
// ... ask technical questions
metrics.trackPhaseEnd();

// Track speaking/listening times
const recordingStartTime = Date.now();
// ... recording happens
metrics.trackSpeaking(Date.now() - recordingStartTime);

// Track API latencies
metrics.trackAPILatency('ElevenLabs', 245);
metrics.trackAPILatency('Deepgram', 1200);

// Track quality metrics
metrics.trackAnswerQuality(0.94); // 0-1 scale
metrics.trackAnswerQuality(0.87);

// Track errors
try {
  // ... some operation
} catch (error) {
  metrics.trackError(error, { phase: 'technical-questions' });
}

// Get comprehensive report
const report = metrics.getReport();
// {
//   interviewId: "interview-candidate-123",
//   duration: 1845000,
//   phases: {
//     greeting: { duration: 245000, count: 1 },
//     personal: { duration: 420000, count: 1 },
//     "technical-questions": { duration: 1180000, count: 5 }
//   },
//   totalSpeakingTime: 245000,
//   totalListeningTime: 1600000,
//   apiLatencies: {
//     "ElevenLabs": [245, 198, 210],
//     "Deepgram": [1200, 1150, 1180]
//   },
//   answerQualities: [0.94, 0.87, 0.91, 0.88],
//   errors: [...]
// }
```

### 3.3 User Behavior Tracking

```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { BehaviorTracker } = AdvancedSentry;

// Track page views
BehaviorTracker.trackPageView('interview-start');

// Track user actions
BehaviorTracker.trackUserAction('Clicked start interview', {
  position: 'center',
  jobTitle: 'Senior React Developer'
});

BehaviorTracker.trackUserAction('Submitted answer', {
  questionNumber: 1,
  answerLength: 250,
  confidence: 0.94
});

// Track errors with context
try {
  const response = await generateSpeech("Test");
} catch (error) {
  BehaviorTracker.trackError('SPEECH_ERROR', error.message, {
    phase: 'greeting',
    voiceId: 'voice-123'
  });
}

// Get all tracked actions
const allActions = BehaviorTracker.getTrackedActions();
```

### 3.4 Session Analytics

```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { SessionAnalytics } = AdvancedSentry;

// Track session lifecycle
const session = SessionAnalytics.startSession('candidate-123', 'interview');

// Track events within session
SessionAnalytics.trackEvent('answer_submitted', {
  question_id: 1,
  quality: 0.94,
  duration: 45000
});

SessionAnalytics.trackEvent('error_occurred', {
  type: 'audio_error',
  recovered: true
});

// End session
SessionAnalytics.endSession();

// Get session report
const report = SessionAnalytics.getReport();
// {
//   sessionId: "...",
//   userId: "candidate-123",
//   sessionType: "interview",
//   startTime: 1234567890,
//   endTime: 1234569000,
//   duration: 1110000,
//   eventCount: 25,
//   events: [...]
// }
```

---

## 4. Complete Integration Example

### 4.1 Advanced Interview Flow

```javascript
'use client';
import { useState, useRef } from 'react';
import { generateStreamingSpeech } from '@/lib/elevenlabs-advanced';
import { transcribeWithAnalysis } from '@/lib/deepgram-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics, BehaviorTracker, PerformanceMonitor } = AdvancedSentry;

export function AdvancedInterview() {
  const metricsRef = useRef(new InterviewMetrics('interview-session'));
  const [currentPhase, setCurrentPhase] = useState('greeting');

  // Function to ask question with streaming voice
  const askQuestion = async (question) => {
    const monitor = PerformanceMonitor.trackTransaction('ask-question', 'speech');
    
    try {
      BehaviorTracker.trackUserAction('Question asked', { question });
      metricsRef.current.trackPhaseStart('speaking');

      // Generate speech with streaming
      const response = await generateStreamingSpeech(question);
      const audioBuffer = await response.arrayBuffer();

      metricsRef.current.trackListening(audioBuffer.byteLength);
      metricsRef.current.trackAPILatency('ElevenLabs', Date.now() - monitor.startTime);

      // Play audio
      const audio = new Audio(URL.createObjectURL(new Blob([audioBuffer])));
      await new Promise(resolve => {
        audio.onended = resolve;
        audio.play();
      });

      metricsRef.current.trackPhaseEnd();
    } catch (error) {
      BehaviorTracker.trackError('QUESTION_ERROR', error.message);
      metricsRef.current.trackError(error);
    } finally {
      monitor.end();
    }
  };

  // Function to record and transcribe answer
  const recordAnswer = async () => {
    const monitor = PerformanceMonitor.trackTransaction('record-answer', 'audio');
    const startTime = Date.now();

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.start();

      BehaviorTracker.trackUserAction('Recording started');

      // Simulate 30 second interview answer
      await new Promise(resolve => setTimeout(resolve, 30000));

      mediaRecorder.stop();

      // Transcribe with advanced analysis
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const result = await transcribeWithAnalysis(audioBlob);

      metricsRef.current.trackSpeaking(Date.now() - startTime);
      metricsRef.current.trackAnswerQuality(result.confidence);
      metricsRef.current.trackAPILatency('Deepgram', Date.now() - startTime);

      BehaviorTracker.trackUserAction('Answer recorded', {
        confidence: result.confidence,
        sentiment: result.sentiment.sentiment,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      BehaviorTracker.trackError('RECORDING_ERROR', error.message);
      metricsRef.current.trackError(error);
      throw error;
    } finally {
      monitor.end();
    }
  };

  // Generate final report
  const generateReport = () => {
    const report = metricsRef.current.getReport();
    BehaviorTracker.trackUserAction('Report generated');
    return report;
  };

  return (
    <div>
      <button onClick={() => askQuestion('Tell me about yourself')}>
        Ask Question
      </button>
      <button onClick={recordAnswer}>
        Record Answer
      </button>
      <button onClick={generateReport}>
        Generate Report
      </button>
    </div>
  );
}
```

---

## 5. Best Practices

### 5.1 Error Handling
- Always wrap API calls in try-catch
- Use PerformanceMonitor.trackTransaction for latency tracking
- Use BehaviorTracker.trackError for error logging
- Implement fallbacks for streaming failures

### 5.2 Performance
- Use streaming TTS for faster playback (generateStreamingSpeech)
- Use batch operations for multiple items (generateBatchSpeech, batchTranscribe)
- Monitor API latencies regularly
- Optimize voice parameters based on metrics

### 5.3 User Experience
- Show interim transcription results
- Display confidence scores to users
- Provide sentiment feedback
- Implement retry mechanisms for failures

### 5.4 Monitoring
- Track all major phases
- Monitor API latencies
- Collect answer quality metrics
- Review error reports regularly
- Generate comprehensive session reports

---

## 6. Voice IDs Reference

Popular professional voices:
- `EXAVITQu4vr4xnSDxMaL` - Adam (recommended for interviews)
- `G2HGSSDIigdKDQDqfXXr` - Bella
- `TxGEqnHWrfKd7m6CoVFH` - Callum
- `EL4zYDF4yf94r2Yb6dlX` - Chris
- `TX3LPaxmHKry59GTYqOA` - Dorothy

Get full list: `getAllVoices()` from `elevenlabs-advanced.js`

---

## 7. Advanced Features Comparison

| Feature | Basic | Advanced |
|---------|-------|----------|
| TTS Speed | Buffered | Streaming |
| Emotion Control | No | Yes (stability, similarity boost) |
| Batch Processing | No | Yes (parallel) |
| Transcription | Basic | With sentiment analysis |
| Speaker ID | No | Yes (diarization) |
| Real-time | No | Yes (WebSocket) |
| Performance Monitoring | Basic logs | Transaction-based |
| Interview Metrics | Phase tracking | Comprehensive (timing, quality) |
| Behavior Tracking | No | Yes (detailed user actions) |
| Error Recovery | Basic | Graceful with fallbacks |

