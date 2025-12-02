# Advanced Features Testing Guide

## Quick Start Testing

This guide helps you test all three advanced features (ElevenLabs, Deepgram, Sentry) with real-world scenarios.

---

## Prerequisites

✅ All three services installed:
```bash
npm list elevenlabs @deepgram/sdk @sentry/nextjs
```

✅ Environment variables configured in `.env.local`:
- `NEXT_PUBLIC_ELEVENLABS_API_KEY`
- `DEEPGRAM_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`

✅ Node.js and npm running

---

## Test 1: ElevenLabs Advanced Features

### 1.1 Basic Streaming TTS

**Endpoint:** `POST /api/interview/advanced-tts`

**Test Script:**
```javascript
// test-elevenlabs-streaming.js
const testStreamingTTS = async () => {
  const response = await fetch('/api/interview/advanced-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Welcome to the advanced interview system with streaming audio.',
      emotion: 'warm',
      useStreaming: true,
      analyzeQuality: true,
    }),
  });

  const data = await response.json();
  console.log('✅ Streaming TTS Response:', {
    latency: data.metadata.latency,
    emotion: data.metadata.emotion,
    quality: data.metadata.quality,
  });

  // Convert base64 to audio and play
  const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
  const audio = new Audio(URL.createObjectURL(new Blob([audioData])));
  audio.play();
};

testStreamingTTS();
```

**Expected Results:**
- ✅ Response latency < 1000ms
- ✅ Quality score > 0.85
- ✅ Audio plays successfully
- ✅ Emotion parameter respected

### 1.2 Emotion Control Testing

**Test Script:**
```javascript
// test-elevenlabs-emotions.js
const emotionTests = async () => {
  const emotions = ['professional', 'enthusiastic', 'warm', 'neutral'];
  
  for (const emotion of emotions) {
    const response = await fetch('/api/interview/advanced-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'I am excited to share my experience.',
        emotion,
        useStreaming: true,
        analyzeQuality: true,
      }),
    });

    const data = await response.json();
    console.log(`📊 ${emotion.toUpperCase()}:`, {
      quality: data.metadata.quality?.quality?.score,
      latency: data.metadata.latency,
      duration: data.metadata.quality?.duration,
    });
  }
};

emotionTests();
```

**Expected Results:**
- ✅ All emotions respond within 1000ms
- ✅ Quality scores consistent (> 0.8)
- ✅ Audio audibly different per emotion
- ✅ No errors for any emotion

### 1.3 Batch Processing

**Test Script:**
```javascript
// test-elevenlabs-batch.js
import { generateBatchSpeech } from '@/lib/elevenlabs-advanced';

const testBatchProcessing = async () => {
  const startTime = Date.now();
  
  const results = await generateBatchSpeech([
    { text: 'Question 1: Tell me about your experience.' },
    { text: 'Question 2: What are your strengths?' },
    { text: 'Question 3: Where do you see yourself?' },
    { text: 'Question 4: How do you handle stress?' },
    { text: 'Question 5: Any questions for us?' },
  ]);

  const totalTime = Date.now() - startTime;
  
  console.log('📊 Batch Processing Results:', {
    total_items: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    total_duration: totalTime,
    average_item_time: (totalTime / results.length).toFixed(0),
  });

  results.forEach((result, index) => {
    console.log(`  ✅ Item ${index + 1}:`, {
      duration: result.duration,
      success: result.success,
    });
  });
};

testBatchProcessing();
```

**Expected Results:**
- ✅ All items processed successfully
- ✅ Total time < (5 * 1000ms) due to parallel processing
- ✅ All audio blobs returned

---

## Test 2: Deepgram Advanced Features

### 2.1 Sentiment Analysis

**Endpoint:** `POST /api/interview/advanced-transcribe`

**Test Script:**
```javascript
// test-deepgram-sentiment.js
const testSentimentAnalysis = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('options', JSON.stringify({
    withSentiment: true,
    withSpeakerDiarization: false,
  }));

  const response = await fetch('/api/interview/advanced-transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  console.log('📊 Sentiment Analysis:', {
    transcript: data.transcript.substring(0, 100),
    confidence: (data.confidence * 100).toFixed(2) + '%',
    sentiment: data.metadata.sentiment.overall,
    sentiment_score: data.metadata.sentiment.score.toFixed(3),
    positive_words: data.metadata.sentiment.wordAnalysis.positive,
    negative_words: data.metadata.sentiment.wordAnalysis.negative,
    latency: data.metadata.latency + 'ms',
  });

  return data;
};

// Record audio first, then test
const recordAndTest = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  // Record for 10 seconds
  setTimeout(() => {
    recorder.stop();
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    testSentimentAnalysis(audioBlob);
  }, 10000);
};

recordAndTest();
```

**Expected Results:**
- ✅ Transcript accuracy > 90% (compared to what you actually said)
- ✅ Sentiment correctly identified (positive/negative/neutral)
- ✅ Confidence score > 0.85
- ✅ Word lists contain relevant words
- ✅ Latency < 2000ms

### 2.2 Speaker Diarization

**Test Script:**
```javascript
// test-deepgram-diarization.js
const testSpeakerDiarization = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('options', JSON.stringify({
    withSentiment: false,
    withSpeakerDiarization: true,
  }));

  const response = await fetch('/api/interview/advanced-transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  console.log('📊 Speaker Diarization:', {
    total_speakers: data.metadata.speakers.totalSpeakers,
    transcript: data.transcript.substring(0, 150),
    confidence: (data.confidence * 100).toFixed(2) + '%',
  });

  // Analyze each speaker
  data.metadata.speakers.speakers.forEach(speaker => {
    console.log(`\n  Speaker ${speaker.speaker + 1} (${speaker.name}):`, {
      segments: speaker.segmentCount,
      total_duration: (speaker.totalDuration / 1000).toFixed(2) + 's',
      first_segment: speaker.segments[0]?.text.substring(0, 50),
    });
  });

  // Find dominant speaker
  const dominant = data.metadata.speakers.dominantSpeaker;
  console.log(`\n🎤 Dominant Speaker:`, {
    speaker: dominant.name,
    talk_time: (dominant.totalDuration / 1000).toFixed(2) + 's',
    segments: dominant.segmentCount,
  });

  return data;
};
```

**Expected Results:**
- ✅ Correctly identifies 2+ speakers if present
- ✅ Separates speaker segments accurately
- ✅ Talk time reflects actual speaking duration
- ✅ Confidence > 0.85

### 2.3 Batch Transcription

**Test Script:**
```javascript
// test-deepgram-batch.js
const testBatchTranscription = async (audioBlobs) => {
  const startTime = Date.now();

  const formDataArray = audioBlobs.map(blob => {
    const fd = new FormData();
    fd.append('audio', blob);
    fd.append('options', JSON.stringify({
      withSentiment: true,
      withSpeakerDiarization: false,
    }));
    return fd;
  });

  const results = await Promise.all(
    formDataArray.map(fd =>
      fetch('/api/interview/advanced-transcribe', {
        method: 'POST',
        body: fd,
      }).then(r => r.json())
    )
  );

  const totalTime = Date.now() - startTime;

  console.log('📊 Batch Transcription:', {
    total_audios: results.length,
    successful: results.filter(r => r.success).length,
    total_time: totalTime + 'ms',
    average_per_audio: (totalTime / results.length).toFixed(0) + 'ms',
  });

  results.forEach((result, index) => {
    console.log(`\n  Audio ${index + 1}:`, {
      transcript: result.transcript.substring(0, 50),
      confidence: (result.confidence * 100).toFixed(2) + '%',
      sentiment: result.metadata.sentiment.overall,
    });
  });
};
```

**Expected Results:**
- ✅ All audios transcribed successfully
- ✅ Parallel processing faster than sequential
- ✅ All confidence scores > 0.85
- ✅ Sentiments detected correctly

---

## Test 3: Sentry Advanced Monitoring

### 3.1 Performance Monitoring

**Test Script:**
```javascript
// test-sentry-performance.js
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { PerformanceMonitor } = AdvancedSentry;

const testPerformanceMonitoring = async () => {
  // Test 1: Track API calls
  const apiMonitor = PerformanceMonitor.trackTransaction('test-api', 'http');
  
  const startTime = Date.now();
  const response = await fetch('/api/interview/advanced-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Test message for performance monitoring',
      emotion: 'professional',
    }),
  });
  
  const latency = Date.now() - startTime;
  apiMonitor.end();

  console.log('✅ API Latency Test:', {
    endpoint: '/api/interview/advanced-tts',
    latency: latency + 'ms',
    status: response.status,
  });

  // Test 2: Track nested operations
  const txn = PerformanceMonitor.startTransaction('complex-operation', 'user-action');
  
  // Span 1: Prepare data
  const span1 = txn.startChild({ op: 'prepare', description: 'Data preparation' });
  await new Promise(resolve => setTimeout(resolve, 100));
  span1.finish();

  // Span 2: Process
  const span2 = txn.startChild({ op: 'process', description: 'Processing' });
  await new Promise(resolve => setTimeout(resolve, 200));
  span2.finish();

  // Span 3: Save
  const span3 = txn.startChild({ op: 'save', description: 'Saving results' });
  await new Promise(resolve => setTimeout(resolve, 150));
  span3.finish();

  txn.finish();

  console.log('✅ Nested Operations Test:', {
    operation: 'complex-operation',
    total_spans: 3,
    expected_time: '~450ms',
  });
};

testPerformanceMonitoring();
```

**Expected Results:**
- ✅ Latencies tracked in Sentry dashboard
- ✅ Nested spans visible in transaction tree
- ✅ All timings accurate (within 50ms)

### 3.2 Interview Metrics

**Test Script:**
```javascript
// test-sentry-metrics.js
const testInterviewMetrics = async () => {
  // Simulate interview lifecycle
  const response = await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start',
      interviewId: `test-${Date.now()}`,
      data: { candidateId: 'candidate-123' },
    }),
  });

  const startData = await response.json();
  const interviewId = startData.interviewId;

  console.log('✅ Interview Started:', { interviewId });

  // Track greeting phase
  await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'track-phase',
      interviewId,
      data: { phase: 'greeting' },
    }),
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Track answer 1
  await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'track-answer',
      interviewId,
      data: {
        questionId: 1,
        answer: 'I have 5 years of React experience and love building scalable applications.',
        duration: 3500,
        confidence: 0.94,
        sentiment: 'positive',
        speakingTime: 3500,
      },
    }),
  });

  // Track answer 2
  await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'track-answer',
      interviewId,
      data: {
        questionId: 2,
        answer: 'My main strength is problem-solving and attention to detail.',
        duration: 3000,
        confidence: 0.91,
        sentiment: 'positive',
        speakingTime: 3000,
      },
    }),
  });

  // Get intermediate report
  const reportResponse = await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get-report',
      interviewId,
    }),
  });

  const reportData = await reportResponse.json();
  console.log('📊 Interview Report:', {
    answer_count: reportData.report.answerCount,
    average_confidence: reportData.report.averageConfidence,
    total_duration: reportData.report.totalDuration + 'ms',
    sentiment_breakdown: reportData.report.sentimentBreakdown,
  });

  // End interview
  const endResponse = await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'end',
      interviewId,
      data: {
        candidateId: 'candidate-123',
        jobTitle: 'Senior React Developer',
      },
    }),
  });

  const finalData = await endResponse.json();
  console.log('✅ Interview Completed:', {
    total_questions: finalData.report.metrics.totalQuestions,
    average_confidence: finalData.report.metrics.averageConfidence,
    sentiment_breakdown: finalData.report.sentiment,
  });
};

testInterviewMetrics();
```

**Expected Results:**
- ✅ All phases tracked correctly
- ✅ Metrics stored and retrievable
- ✅ Final report comprehensive and accurate
- ✅ Sentiment breakdown correct

### 3.3 Error Tracking

**Test Script:**
```javascript
// test-sentry-errors.js
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { BehaviorTracker } = AdvancedSentry;

const testErrorTracking = async () => {
  console.log('🧪 Testing error tracking...');

  // Test 1: Track user action
  BehaviorTracker.trackUserAction('Test action initiated', {
    testId: 'error-test-001',
    timestamp: new Date().toISOString(),
  });

  // Test 2: Track error
  const error = new Error('Test error for validation');
  BehaviorTracker.trackError('TEST_ERROR', error.message, {
    severity: 'high',
    testId: 'error-test-001',
  });

  console.log('✅ Error tracked and sent to Sentry');

  // Test 3: Track page view
  BehaviorTracker.trackPageView('test-page');

  // Get all actions
  const actions = BehaviorTracker.getTrackedActions();
  console.log('📊 Tracked Actions:', {
    total_actions: actions.length,
    action_types: [...new Set(actions.map(a => a.action))],
  });

  // Wait for Sentry to send
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ Check Sentry dashboard for captured events');
};

testErrorTracking();
```

**Expected Results:**
- ✅ User actions logged
- ✅ Errors captured with context
- ✅ Events visible in Sentry dashboard
- ✅ Breadcrumbs recorded

---

## Integration Test: Full Interview Simulation

**Test Script:**
```javascript
// test-full-interview.js
const fullInterviewTest = async () => {
  console.log('🚀 Starting Full Interview Simulation\n');

  const interviewId = `full-test-${Date.now()}`;
  let recordingTime = 0;
  let speakingTime = 0;

  // Step 1: Initialize metrics
  console.log('1️⃣ Initializing interview...');
  const initResponse = await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'start',
      interviewId,
      data: { candidateId: 'test-user' },
    }),
  });
  console.log('✅ Interview initialized\n');

  // Step 2: AI speaks greeting
  console.log('2️⃣ Generating greeting...');
  const greetingResponse = await fetch('/api/interview/advanced-tts', {
    method: 'POST',
    body: JSON.stringify({
      text: 'Welcome! Tell me about your background.',
      emotion: 'warm',
      useStreaming: true,
    }),
  });
  const greetingData = await greetingResponse.json();
  console.log(`✅ Greeting generated (${greetingData.metadata.latency}ms)\n`);

  // Step 3: Record answer
  console.log('3️⃣ Recording answer...');
  const startRecord = Date.now();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  // Simulate 15 second answer
  await new Promise(resolve => setTimeout(resolve, 15000));
  recorder.stop();

  recordingTime = Date.now() - startRecord;
  const audioBlob = new Blob(chunks, { type: 'audio/webm' });
  console.log(`✅ Answer recorded (${recordingTime}ms)\n`);

  // Step 4: Transcribe with analysis
  console.log('4️⃣ Transcribing answer...');
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

  speakingTime = recordingTime;
  console.log(`✅ Transcribed (${transcribeData.metadata.latency}ms)`);
  console.log(`   Confidence: ${(transcribeData.confidence * 100).toFixed(2)}%`);
  console.log(`   Sentiment: ${transcribeData.metadata.sentiment.overall}\n`);

  // Step 5: Track metrics
  console.log('5️⃣ Tracking metrics...');
  await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'track-answer',
      interviewId,
      data: {
        questionId: 1,
        answer: transcribeData.transcript,
        duration: recordingTime,
        confidence: transcribeData.confidence,
        sentiment: transcribeData.metadata.sentiment.overall,
        speakingTime,
      },
    }),
  });
  console.log('✅ Metrics tracked\n');

  // Step 6: Generate final report
  console.log('6️⃣ Generating final report...');
  const reportResponse = await fetch('/api/interview/advanced-metrics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'end',
      interviewId,
      data: {
        candidateId: 'test-user',
        jobTitle: 'Test Role',
      },
    }),
  });

  const reportData = await reportResponse.json();
  console.log('✅ Interview Complete!\n');

  // Summary
  console.log('📊 INTERVIEW SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Duration: ${(reportData.report.duration / 1000).toFixed(2)}s`);
  console.log(`Questions: ${reportData.report.metrics.totalQuestions}`);
  console.log(`Confidence: ${reportData.report.metrics.averageConfidence}`);
  console.log(`Sentiment: ${reportData.report.sentiment.percentages.positive}% positive`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

fullInterviewTest();
```

---

## Monitoring in Sentry Dashboard

After running tests, visit [Sentry Dashboard](https://sentry.io) and:

1. **Performance Tab:**
   - View transaction latencies
   - Check span durations
   - Identify bottlenecks

2. **Issues Tab:**
   - See all tracked errors
   - Review error context
   - Check breadcrumb trails

3. **Releases Tab:**
   - Monitor deployment health
   - Track error trends

4. **Analytics:**
   - View session metrics
   - User behavior patterns
   - Performance trends

---

## Success Criteria Checklist

- [ ] ✅ ElevenLabs streaming TTS working (< 1000ms latency)
- [ ] ✅ Emotion control producing audible differences
- [ ] ✅ Batch processing faster than sequential
- [ ] ✅ Deepgram sentiment analysis accurate (> 90%)
- [ ] ✅ Speaker diarization correctly identifying speakers
- [ ] ✅ Transcription confidence > 0.85
- [ ] ✅ Sentry tracking all metrics and errors
- [ ] ✅ Full interview simulation completing successfully
- [ ] ✅ Events visible in Sentry dashboard
- [ ] ✅ Performance data accurate and tracked

---

## Troubleshooting

**Audio not playing:**
- Check API key validity
- Verify browser permissions
- Check browser console for errors

**Transcription failing:**
- Verify Deepgram API key
- Check audio format (should be webm/wav)
- Verify audio quality (not too quiet)

**Metrics not tracking:**
- Check Sentry DSN validity
- Verify browser network requests
- Check Sentry project settings

**Sentiment not detected:**
- Ensure audio contains speech
- Check audio confidence > 0.85
- Verify Deepgram API limits not exceeded
