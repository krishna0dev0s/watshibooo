// Advanced Voice Interview with Maximum Features
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateAdvancedSpeech, playAudioAdvanced, generateStreamingSpeech } from '@/lib/elevenlabs-advanced';
import { transcribeWithAnalysis, setupLiveTranscription } from '@/lib/deepgram-advanced';
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics, BehaviorTracker, PerformanceMonitor } = AdvancedSentry;

export default function AdvancedVoiceInterview({ company, job, questions }) {
  const [phase, setPhase] = useState('greeting');
  const [interviewMetrics, setInterviewMetrics] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [sentiment, setSentiment] = useState(null);
  const [advancedStats, setAdvancedStats] = useState({
    speakingTime: 0,
    listeningTime: 0,
    apiLatencies: [],
  });

  const metricsRef = useRef(null);
  const recordingStartRef = useRef(null);

  // Initialize metrics on component mount
  useEffect(() => {
    const metrics = new InterviewMetrics(`interview-${Date.now()}`);
    metricsRef.current = metrics;
    setInterviewMetrics(metrics);

    BehaviorTracker.trackPageView('interview');
    metrics.trackPhaseStart(phase);

    return () => {
      if (metricsRef.current) {
        const report = metricsRef.current.getReport();
        console.log('Interview Report:', report);
      }
    };
  }, []);

  // Advanced speaking function with streaming
  const advancedSpeak = async (text, voiceId = 'EXAVITQu4vr4xnSDxMaL') => {
    const monitor = PerformanceMonitor.trackTransaction(`speak-${phase}`, 'speech');
    const startTime = Date.now();

    try {
      BehaviorTracker.trackUserAction(`AI speaking: ${text.substring(0, 50)}...`);

      // Try streaming first (faster)
      const streamResponse = await generateStreamingSpeech(text, voiceId);

      if (streamResponse) {
        const audioBuffer = await streamResponse.arrayBuffer();
        const latency = Date.now() - startTime;

        metricsRef.current?.trackListening(latency);
        metricsRef.current?.trackAPILatency('ElevenLabs-Streaming', latency);

        setAdvancedStats(prev => ({
          ...prev,
          apiLatencies: [...prev.apiLatencies, latency],
        }));

        playAudioAdvanced(audioBuffer, {
          volume: 1,
          playbackRate: 1,
          onComplete: () => {
            BehaviorTracker.trackUserAction('AI finished speaking');
          },
        });
      }
    } catch (error) {
      BehaviorTracker.trackError('SPEAK_ERROR', error.message, { text });
      metricsRef.current?.trackError(error, { phase, action: 'speak' });
    } finally {
      monitor.end();
    }
  };

  // Advanced recording with real-time transcription
  const advancedStartRecording = async () => {
    const monitor = PerformanceMonitor.trackTransaction('recording', 'audio');
    recordingStartRef.current = Date.now();

    try {
      BehaviorTracker.trackUserAction('Recording started', { phase });

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const recordingDuration = Date.now() - recordingStartRef.current;

        metricsRef.current?.trackSpeaking(recordingDuration);

        // Transcribe with advanced analysis
        const transcriptionMonitor = PerformanceMonitor.trackTransaction(
          'transcribe',
          'speech-to-text'
        );
        const transcribeStart = Date.now();

        const result = await transcribeWithAnalysis(audioBlob);

        const transcribeLatency = Date.now() - transcribeStart;
        metricsRef.current?.trackAPILatency('Deepgram-Advanced', transcribeLatency);

        if (result.success) {
          setLiveTranscript(result.transcript);
          setConfidence(parseFloat((result.confidence * 100).toFixed(2)));
          setSentiment(result.sentiment);

          BehaviorTracker.trackUserAction('Transcription complete', {
            confidence: result.confidence,
            sentiment: result.sentiment.sentiment,
          });

          // Track quality
          const quality = result.confidence > 0.8 ? 'high' : 'medium';
          metricsRef.current?.trackAnswerQuality(result.confidence * 100);
        }

        transcriptionMonitor.end();
        monitor.end();
      };

      mediaRecorder.start();

      return {
        stop: () => mediaRecorder.stop(),
        mediaStream,
        mediaRecorder,
      };
    } catch (error) {
      BehaviorTracker.trackError('RECORDING_ERROR', error.message, { phase });
      metricsRef.current?.trackError(error, { phase, action: 'recording' });
      monitor.end();
      throw error;
    }
  };

  // Handle phase transitions
  const handlePhaseTransition = (newPhase) => {
    metricsRef.current?.trackPhaseEnd();
    setPhase(newPhase);
    metricsRef.current?.trackPhaseStart(newPhase);

    BehaviorTracker.trackUserAction('Phase transition', {
      from: phase,
      to: newPhase,
    });
  };

  // Get interview report
  const getInterviewReport = () => {
    if (!metricsRef.current) return null;

    const report = metricsRef.current.getReport();
    return {
      ...report,
      sentiment: sentiment,
      confidenceStats: {
        average: confidence,
        highest: Math.max(...(advancedStats.apiLatencies || [0])),
      },
      performanceMetrics: advancedStats,
    };
  };

  return (
    <div className="space-y-6">
      {/* Phase Display */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
        <h2 className="text-2xl font-bold">Advanced Interview</h2>
        <p>Phase: {phase.toUpperCase()}</p>
        <p>Confidence: {confidence.toFixed(2)}%</p>
        {sentiment && <p>Sentiment: {sentiment.sentiment.toUpperCase()}</p>}
      </div>

      {/* Live Transcript Display */}
      {liveTranscript && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Live Transcript</h3>
          <p className="text-gray-700">{liveTranscript}</p>
          <p className="text-sm text-gray-500 mt-2">Confidence: {confidence.toFixed(2)}%</p>
        </div>
      )}

      {/* Recording Controls */}
      <button
        onClick={advancedStartRecording}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Start Advanced Recording
      </button>

      {/* Phase Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => handlePhaseTransition('greeting')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Greeting
        </button>
        <button
          onClick={() => handlePhaseTransition('personal')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Personal
        </button>
        <button
          onClick={() => handlePhaseTransition('questions')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Questions
        </button>
      </div>

      {/* Statistics */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-4">Interview Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Speaking Time</p>
            <p className="text-2xl font-bold">{advancedStats.speakingTime}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Listening Time</p>
            <p className="text-2xl font-bold">{advancedStats.listeningTime}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average API Latency</p>
            <p className="text-2xl font-bold">
              {advancedStats.apiLatencies.length > 0
                ? (advancedStats.apiLatencies.reduce((a, b) => a + b, 0) /
                    advancedStats.apiLatencies.length).toFixed(0)
                : 0}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transcription Confidence</p>
            <p className="text-2xl font-bold">{confidence.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Final Report Button */}
      <button
        onClick={() => {
          const report = getInterviewReport();
          console.log('Interview Report:', report);
          alert('Report generated - check console');
        }}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
      >
        Generate Final Report
      </button>
    </div>
  );
}
