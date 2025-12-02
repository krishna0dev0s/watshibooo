// Enhanced Interview Component with Advanced Features
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdvancedInterview } from '@/hooks/use-advanced-interview';

export function AdvancedInterviewDemo() {
  const {
    isRecording,
    transcript,
    sentiment,
    confidence,
    startRecording,
    stopRecording,
    speakWithEmotion,
    trackAnswer,
  } = useAdvancedInterview();

  const [interviewId] = useState(`interview-${Date.now()}`);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const questions = [
    'Tell me about your background and experience.',
    'What are your main strengths?',
    'How do you handle challenges at work?',
    'Where do you see yourself in 5 years?',
    'Do you have any questions for us?',
  ];

  // Ask current question with emotional voice
  const askQuestion = async () => {
    setIsPlaying(true);
    const result = await speakWithEmotion(
      questions[currentQuestion],
      'warm'
    );
    setIsPlaying(false);

    if (result.success) {
      console.log(`Question asked (${result.latency}ms latency)`);
    }
  };

  // Handle recording done
  const handleStopRecording = async () => {
    await stopRecording();

    // Track the answer
    if (transcript) {
      await trackAnswer(interviewId, currentQuestion + 1, transcript);

      // Save answer
      setAnswers([
        ...answers,
        {
          question: questions[currentQuestion],
          answer: transcript,
          sentiment,
          confidence: (confidence * 100).toFixed(2),
        },
      ]);

      // Move to next question
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Advanced Interview Demo</h2>
        <p className="text-gray-600">
          Interview {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Current Question */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Question {currentQuestion + 1}:
        </h3>
        <p className="text-gray-700 text-lg mb-6">{questions[currentQuestion]}</p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={askQuestion}
            disabled={isPlaying}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isPlaying ? '🔊 Speaking...' : '🔊 Hear Question'}
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 animate-pulse"
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white p-6 rounded-lg shadow space-y-3">
          <h4 className="font-semibold text-gray-800">Your Answer:</h4>
          <p className="text-gray-700">{transcript}</p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-xl font-bold text-blue-600">
                {(confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Sentiment</p>
              <p className={`text-xl font-bold ${
                sentiment === 'positive' ? 'text-green-600' :
                sentiment === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {sentiment?.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-xl font-bold text-green-600">✓ Recorded</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Progress</h4>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Previous Answers */}
      {answers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800 mb-4">Interview Responses</h4>
          <div className="space-y-4">
            {answers.map((ans, idx) => (
              <div key={idx} className="pb-4 border-b last:border-b-0">
                <p className="font-medium text-gray-700">Q: {ans.question}</p>
                <p className="text-gray-600 text-sm mt-1">{ans.answer}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded ${
                      ans.sentiment === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ans.sentiment}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {ans.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {currentQuestion === questions.length - 1 && answers.length === questions.length && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
          <h4 className="font-bold text-lg text-green-800 mb-2">✨ Interview Complete!</h4>
          <p className="text-green-700 mb-4">
            You answered all {questions.length} questions. Check your metrics in the Sentry dashboard.
          </p>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            View Full Report
          </button>
        </div>
      )}
    </div>
  );
}
