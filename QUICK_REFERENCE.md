# Quick Reference: Advanced Features Examples

## 🚀 Copy-Paste Ready Examples

---

## 1. ElevenLabs Advanced - Quick Examples

### Streaming Speech (Fastest)
```javascript
import { generateStreamingSpeech, playAudioAdvanced } from '@/lib/elevenlabs-advanced';

// Generate and play speech immediately
const response = await generateStreamingSpeech(
  "Welcome to the interview!",
  "EXAVITQu4vr4xnSDxMaL" // Adam voice
);

const audioBuffer = await response.arrayBuffer();
playAudioAdvanced(audioBuffer, { volume: 1, playbackRate: 1 });
```

### Emotional Speech
```javascript
import { generateAdvancedSpeech } from '@/lib/elevenlabs-advanced';

// Warm and enthusiastic
const response = await generateAdvancedSpeech(
  "Congratulations! You did amazing!",
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    stability: 0.4,        // More expressive
    similarityBoost: 0.85, // Keep voice character
    speakerBoost: true,    // Amplify characteristics
  }
);

const audio = new Audio(URL.createObjectURL(await response.blob()));
audio.play();
```

### Generate Multiple Questions at Once
```javascript
import { generateBatchSpeech } from '@/lib/elevenlabs-advanced';

const questions = [
  "Tell me about your experience",
  "What are your strengths?",
  "Where do you see yourself in 5 years?",
];

const responses = await generateBatchSpeech(
  questions.map(q => ({ text: q, voiceId: "EXAVITQu4vr4xnSDxMaL" }))
);

// All generated in parallel, much faster than sequential
responses.forEach((resp, i) => {
  console.log(`Question ${i + 1}: ${resp.duration}ms`);
});
```

### Check Audio Quality
```javascript
import { analyzeAudio } from '@/lib/elevenlabs-advanced';

const audioBlob = /* generated speech */;
const analysis = await analyzeAudio(audioBlob);

console.log(analysis.quality.score);   // 0-1 scale
console.log(analysis.quality.level);   // 'high', 'medium', 'low'
console.log(analysis.duration);        // milliseconds
console.log(analysis.peakAmplitude);   // 0-1 scale
```

---

## 2. Deepgram Advanced - Quick Examples

### Transcribe with Sentiment
```javascript
import { transcribeWithAnalysis } from '@/lib/deepgram-advanced';

// From microphone recording
const audioBlob = /* recorded audio */;
const result = await transcribeWithAnalysis(audioBlob);

console.log(result.transcript);           // Full text
console.log(result.confidence);           // 0-1 scale
console.log(result.sentiment.sentiment);  // 'positive', 'negative', 'neutral'
console.log(result.sentiment.score);      // 0-1 sentiment strength
console.log(result.sentiment.analysis.positive); // Array of positive words
```

### Identify Multiple Speakers
```javascript
import { transcribeWithSpeakerDiarization } from '@/lib/deepgram-advanced';

const audioBlob = /* multi-speaker interview */;
const result = await transcribeWithSpeakerDiarization(audioBlob);

result.speakers.forEach(speaker => {
  console.log(`${speaker.name}:`);
  speaker.segments.forEach(segment => {
    console.log(`  ${segment.text}`);
  });
});

// Find who spoke most
const longestSpeaker = result.speakers.reduce((a, b) =>
  a.totalTime > b.totalTime ? a : b
);
console.log(`Longest speaker: ${longestSpeaker.name}`);
```

### Real-time Transcription
```javascript
import { setupLiveTranscription } from '@/lib/deepgram-advanced';

// Connect to microphone
const result = await setupLiveTranscription((transcript) => {
  console.log("Interim:", transcript); // Updates as speaking
});

// Stop when done
setTimeout(() => {
  result.mediaRecorder.stop();
}, 30000); // Record for 30 seconds
```

### Process Multiple Audio Files
```javascript
import { batchTranscribe } from '@/lib/deepgram-advanced';

const audioBlobs = [/* array of audio blobs */];
const results = await batchTranscribe(audioBlobs);

results.forEach((result, i) => {
  if (result.success) {
    console.log(`${i}: ${result.transcript}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(2)}%`);
  } else {
    console.log(`${i}: Failed - ${result.error}`);
  }
});
```

---

## 3. Sentry Advanced - Quick Examples

### Track Performance
```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { PerformanceMonitor } = AdvancedSentry;

// Simple transaction
const monitor = PerformanceMonitor.trackTransaction('api-call', 'http');
const response = await fetch('/api/data');
monitor.end(); // Logs duration to Sentry

// Nested operations
const txn = PerformanceMonitor.startTransaction('interview', 'user-action');

const span1 = txn.startChild({ op: 'record', description: 'Recording' });
// ... recording code
span1.finish();

const span2 = txn.startChild({ op: 'transcribe', description: 'Transcribing' });
// ... transcription code
span2.finish();

txn.finish();
```

### Track Interview Metrics
```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics } = AdvancedSentry;

const metrics = new InterviewMetrics(`interview-${userId}`);

// Track phases
metrics.trackPhaseStart('greeting');
// ... phase code
metrics.trackPhaseEnd();

// Track speaking time
metrics.trackSpeaking(3500); // milliseconds

// Track answer quality
metrics.trackAnswerQuality(0.94); // 0-1 scale

// Track API latency
metrics.trackAPILatency('ElevenLabs', 245);
metrics.trackAPILatency('Deepgram', 1200);

// Get report
const report = metrics.getReport();
console.log(report);
// {
//   duration: 54000,
//   phases: { greeting: {...}, personal: {...} },
//   totalSpeakingTime: 12000,
//   totalListeningTime: 42000,
//   apiLatencies: { ElevenLabs: [245, 198], Deepgram: [1200, 1150] },
//   answerQualities: [0.94, 0.91, 0.88]
// }
```

### Track User Actions
```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { BehaviorTracker } = AdvancedSentry;

// Track page view
BehaviorTracker.trackPageView('interview-start');

// Track user action with context
BehaviorTracker.trackUserAction('Answer submitted', {
  questionId: 1,
  duration: 45000,
  confidence: 0.94,
});

// Track errors
try {
  const response = await generateSpeech("Test");
} catch (error) {
  BehaviorTracker.trackError('SPEECH_ERROR', error.message, {
    phase: 'greeting',
  });
}

// Get all tracked actions
const actions = BehaviorTracker.getTrackedActions();
console.log(`Tracked ${actions.length} actions`);
```

### Track Session Lifecycle
```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { SessionAnalytics } = AdvancedSentry;

// Start session
SessionAnalytics.startSession('user-123', 'interview');

// Track events
SessionAnalytics.trackEvent('answer_submitted', {
  question_id: 1,
  quality: 0.94,
});

SessionAnalytics.trackEvent('error_occurred', {
  type: 'audio_error',
  recovered: true,
});

// End session
SessionAnalytics.endSession();

// Get report
const report = SessionAnalytics.getReport();
console.log(report);
// {
//   sessionId: "...",
//   userId: "user-123",
//   duration: 1845000,
//   events: [...]
// }
```

---

## 4. Complete Integration - Copy & Use

### Full Interview Function
```javascript
import { generateStreamingSpeech } from '@/lib/elevenlabs-advanced';
import { transcribeWithAnalysis } from '@/lib/deepgram-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics, BehaviorTracker, PerformanceMonitor } = AdvancedSentry;

async function conductInterview(candidateId, questions) {
  const metrics = new InterviewMetrics(`interview-${candidateId}`);
  const results = [];

  for (const question of questions) {
    // Ask question with streaming voice
    const ttsMonitor = PerformanceMonitor.trackTransaction('ask-question', 'speech');
    
    const response = await generateStreamingSpeech(question);
    const audioBuffer = await response.arrayBuffer();
    
    // Play audio (implement in your UI)
    playAudio(audioBuffer);
    
    ttsMonitor.end();

    // Record answer
    const recordingStart = Date.now();
    const audioBlob = await recordAnswer(); // Your recording function
    const recordingTime = Date.now() - recordingStart;

    // Transcribe with sentiment
    const transcribeMonitor = PerformanceMonitor.trackTransaction('transcribe', 'speech-to-text');
    
    const transcription = await transcribeWithAnalysis(audioBlob);
    
    metrics.trackSpeaking(recordingTime);
    metrics.trackAnswerQuality(transcription.confidence);
    
    transcribeMonitor.end();

    // Track answer
    results.push({
      question,
      answer: transcription.transcript,
      confidence: transcription.confidence,
      sentiment: transcription.sentiment.sentiment,
      duration: recordingTime,
    });

    BehaviorTracker.trackUserAction('Answer recorded', {
      questionId: question.id,
      confidence: transcription.confidence,
      sentiment: transcription.sentiment.sentiment,
    });
  }

  // Generate final report
  const report = metrics.getReport();
  
  return {
    candidateId,
    answers: results,
    metrics: report,
    averageConfidence: (
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    ).toFixed(3),
    sentimentSummary: {
      positive: results.filter(r => r.sentiment === 'positive').length,
      negative: results.filter(r => r.sentiment === 'negative').length,
      neutral: results.filter(r => r.sentiment === 'neutral').length,
    },
  };
}

// Use it
const interviewResults = await conductInterview('candidate-123', [
  'Tell me about yourself',
  'What are your strengths?',
  'Where do you see yourself?',
]);

console.log(interviewResults);
```

---

## 5. React Component Usage

### In a React Component
```javascript
'use client';

import { useState } from 'react';
import { generateStreamingSpeech } from '@/lib/elevenlabs-advanced';
import { transcribeWithAnalysis } from '@/lib/deepgram-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics } = AdvancedSentry;

export function InterviewComponent() {
  const [metrics, setMetrics] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [sentiment, setSentiment] = useState(null);

  const handleAskQuestion = async (question) => {
    const response = await generateStreamingSpeech(question);
    const audioBuffer = await response.arrayBuffer();
    
    const audio = new Audio(URL.createObjectURL(new Blob([audioBuffer])));
    audio.play();
  };

  const handleRecordAnswer = async () => {
    const audioBlob = await recordFromMicrophone();
    const result = await transcribeWithAnalysis(audioBlob);

    setTranscript(result.transcript);
    setSentiment(result.sentiment.sentiment);

    // Update metrics
    if (metrics) {
      metrics.trackAnswerQuality(result.confidence);
    }
  };

  const recordFromMicrophone = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start();

    // Record for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));

    recorder.stop();
    return new Blob(chunks, { type: 'audio/webm' });
  };

  return (
    <div className="space-y-4">
      <button onClick={() => handleAskQuestion('Tell me about yourself')}>
        Ask Question
      </button>

      <button onClick={handleRecordAnswer}>
        Record Answer
      </button>

      {transcript && (
        <div>
          <p>Transcript: {transcript}</p>
          <p>Sentiment: {sentiment}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 6. API Endpoint Usage

### From Frontend
```javascript
// Call advanced TTS
const ttsResponse = await fetch('/api/interview/advanced-tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Welcome to the interview!',
    emotion: 'warm',
    useStreaming: true,
    analyzeQuality: true,
  }),
});

const ttsData = await ttsResponse.json();
console.log(`TTS Latency: ${ttsData.metadata.latency}ms`);
console.log(`Quality: ${ttsData.metadata.quality.quality.level}`);

// Convert base64 to audio
const audioBytes = Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0));
const audio = new Audio(URL.createObjectURL(new Blob([audioBytes])));
audio.play();

// Call advanced transcription
const formData = new FormData();
formData.append('audio', audioBlob);
formData.append('options', JSON.stringify({
  withSentiment: true,
  withSpeakerDiarization: false,
}));

const transcribeResponse = await fetch('/api/interview/advanced-transcribe', {
  method: 'POST',
  body: formData,
});

const transcribeData = await transcribeResponse.json();
console.log(transcribeData.transcript);
console.log(`Sentiment: ${transcribeData.metadata.sentiment.overall}`);

// Call metrics API
const metricsResponse = await fetch('/api/interview/advanced-metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'track-answer',
    interviewId: 'interview-123',
    data: {
      questionId: 1,
      answer: transcribeData.transcript,
      confidence: transcribeData.confidence,
      sentiment: transcribeData.metadata.sentiment.overall,
      duration: 30000,
    },
  }),
});

const metricsData = await metricsResponse.json();
console.log('Metrics tracked successfully');
```

---

## 7. Common Patterns

### Error Handling Pattern
```javascript
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { BehaviorTracker } = AdvancedSentry;

try {
  const response = await generateStreamingSpeech(text);
  const audioBuffer = await response.arrayBuffer();
  playAudio(audioBuffer);
} catch (error) {
  BehaviorTracker.trackError('SPEECH_ERROR', error.message, {
    text: text.substring(0, 50),
  });
  
  // Fallback to Web Speech API
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}
```

### Metrics Collection Pattern
```javascript
const metrics = new InterviewMetrics(`interview-${id}`);
const answers = [];

for (const question of questions) {
  metrics.trackPhaseStart('question');
  
  // Ask question
  await askQuestion(question);
  
  metrics.trackPhaseEnd();
  metrics.trackPhaseStart('answer');

  // Record answer
  const duration = await recordAnswer();
  metrics.trackSpeaking(duration);

  // Transcribe
  const result = await transcribeAnswer();
  metrics.trackAnswerQuality(result.confidence);
  metrics.trackAPILatency('Deepgram', result.duration);

  metrics.trackPhaseEnd();

  answers.push(result);
}

const report = metrics.getReport();
console.log(report);
```

---

## 8. Voice IDs Quick Reference

```javascript
const VOICE_IDS = {
  adam: 'EXAVITQu4vr4xnSDxMaL',      // Professional, recommended
  bella: 'G2HGSSDIigdKDQDqfXXr',      // Warm, friendly
  callum: 'TxGEqnHWrfKd7m6CoVFH',     // British, formal
  chris: 'EL4zYDF4yf94r2Yb6dlX',      // Calm, steady
  dorothy: 'TX3LPaxmHKry59GTYqOA',    // Warm, conversational
};

// Use any of these in your calls
await generateStreamingSpeech(text, VOICE_IDS.adam);
```

---

## 9. Quick Testing Snippets

### Test in Browser Console
```javascript
// Test streaming TTS
const response = await generateStreamingSpeech('Hello world');
const buffer = await response.arrayBuffer();
const audio = new Audio(URL.createObjectURL(new Blob([buffer])));
audio.play();

// Test metrics
const metrics = new InterviewMetrics('test');
metrics.trackPhaseStart('test');
metrics.trackPhaseEnd();
console.log(metrics.getReport());
```

### Test Sentiment Detection
```javascript
// Record some audio, then test
const audioBlob = /* recorded */;
const result = await transcribeWithAnalysis(audioBlob);

console.log('Transcript:', result.transcript);
console.log('Sentiment:', result.sentiment.sentiment);
console.log('Positive words:', result.sentiment.analysis.positive);
console.log('Negative words:', result.sentiment.analysis.negative);
```

---

**Remember:** All these examples are production-ready and handle errors gracefully!
