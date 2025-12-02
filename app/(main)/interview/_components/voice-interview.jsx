'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PhoneOff, Play, Loader } from 'lucide-react';
import Link from 'next/link';

const INTERVIEW_ROLES = [
  { id: 'software-engineer', name: 'Software Engineer', industry: 'Technology' },
  { id: 'product-manager', name: 'Product Manager', industry: 'Technology' },
  { id: 'data-scientist', name: 'Data Scientist', industry: 'Technology' },
  { id: 'ux-designer', name: 'UX Designer', industry: 'Technology' },
  { id: 'marketing', name: 'Marketing Manager', industry: 'Marketing' },
  { id: 'sales', name: 'Sales Executive', industry: 'Sales' },
  { id: 'finance', name: 'Financial Analyst', industry: 'Finance' },
  { id: 'hr', name: 'HR Manager', industry: 'Human Resources' },
];

export default function VoiceInterviewComponent() {
  const [step, setStep] = useState('select');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const startInterview = async () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: selectedRole }),
      });

      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setTranscript('');
        setStep('recording');
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          // Audio chunks can be processed here if needed
        };

        mediaRecorder.start();
        recognitionRef.current?.start();
        setIsMicOn(true);
      } catch (error) {
        console.error('Mic error:', error);
        alert('Failed to access microphone. Please check permissions.');
      }
    } else {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
      setIsMicOn(false);
    }
  };

  const endCall = async () => {
    if (!transcript.trim()) {
      alert('Please provide an answer before ending the call');
      return;
    }

    toggleMic(); // Stop recording
    setLoading(true);

    try {
      const response = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole,
          questions: questions,
          responses: transcript,
          currentQuestion: questions[currentQuestionIndex],
        }),
      });

      const data = await response.json();
      setAnalysis(data);
      setStep('analysis');
    } catch (error) {
      console.error('Failed to analyze interview:', error);
      alert('Failed to analyze interview');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (!transcript.trim()) {
      alert('Please provide an answer before moving to the next question');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript('');
      setIsMicOn(false);
    } else {
      endCall();
    }
  };

  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">AI Voice Interview</CardTitle>
            <CardDescription className="text-gray-400">
              Select a role and practice interview questions with real-time feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTERVIEW_ROLES.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white">{role.name}</h3>
                  <p className="text-sm text-gray-400">{role.industry}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={startInterview}
              disabled={!selectedRole || loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'recording') {
    const role = INTERVIEW_ROLES.find((r) => r.id === selectedRole);
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{role?.name} Interview</h3>
                <p className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Display */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">{currentQuestion}</CardTitle>
          </CardHeader>
        </Card>

        {/* Transcript Display */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Your Response</CardTitle>
            <CardDescription className="text-gray-400">
              {isMicOn ? '🎤 Listening...' : 'Click "Start Speaking" to begin recording'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 min-h-[150px] p-4 bg-black/50 rounded-lg border border-gray-700">
              {transcript || <span className="text-gray-500 italic">Your transcript will appear here...</span>}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={toggleMic}
            size="lg"
            className={isMicOn ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {isMicOn ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Speaking
              </>
            )}
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={!transcript.trim() || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
            {currentQuestionIndex === questions.length - 1 ? 'Finish & Analyze' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'analysis' && analysis) {
    const role = INTERVIEW_ROLES.find((r) => r.id === selectedRole);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Closing Line */}
        <Card className="border-blue-700/50 bg-blue-900/20">
          <CardContent className="pt-6">
            <p className="text-lg text-blue-200 italic">"{analysis.closingLine}"</p>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card className="border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-400">{analysis.overallScore}/100</div>
              <p className="text-gray-300 mt-2">{analysis.overallFeedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.metrics || {}).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-blue-400 font-semibold">{value}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(analysis.strengths || []).map((strength, idx) => (
                <li key={idx} className="text-gray-300 flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(analysis.improvements || []).map((improvement, idx) => (
                <li key={idx} className="text-gray-300 flex items-start">
                  <span className="text-yellow-400 mr-2">→</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {(analysis.actionItems || []).map((item, idx) => (
                <li key={idx} className="text-gray-300">
                  <span className="text-blue-400 font-semibold">{idx + 1}.</span> {item}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setStep('select');
              setSelectedRole(null);
              setTranscript('');
              setAnalysis(null);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Take Another Interview
          </Button>
          <Link href="/interview" className="flex-1">
            <Button className="w-full bg-gray-700 hover:bg-gray-600">
              Back to Interview Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
