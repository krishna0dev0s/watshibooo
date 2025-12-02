'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PhoneOff, Volume2, Send } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { generateSpeech, playAudio } from '@/lib/elevenlabs-client';
import { transcribeAudio } from '@/lib/deepgram-client';
import { captureException, addBreadcrumb, setUser } from '@/lib/sentry-client';

export default function VoiceInterviewWithRole({ company, job, questions, onBack, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [interviewPhase, setInterviewPhase] = useState('greeting'); // greeting, personal, questions
  const [candidateName, setCandidateName] = useState('');
  const [useElevenLabs, setUseElevenLabs] = useState(true); // Toggle for ElevenLabs
  const [useDeepgram, setUseDeepgram] = useState(true); // Toggle for Deepgram

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const conversationEndRef = useRef(null);
  const synthRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Initialize Web Speech API and Text-to-Speech
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            transcript += transcriptSegment + ' ';
          }
        }

        if (transcript) {
          setUserTranscript((prev) => prev + transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        // Ignore 'aborted' errors as they occur when we intentionally stop recognition
        if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };
    }

    // Initialize Text-to-Speech
    const synth = window.speechSynthesis;
    synthRef.current = synth;

    // Start the interview with greeting
    startInterview();
  }, []);

  // Start the interview with greeting
  const startInterview = async () => {
    try {
      const greetingResponse = await fetch('/api/interview/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'greeting',
        }),
      });

      if (!greetingResponse.ok) {
        throw new Error(`API error: ${greetingResponse.status}`);
      }

      const data = await greetingResponse.json();
      const greetingMsg = data.response || data || "Hey! Thanks for taking the time to chat with me. What's your name?";
      
      // Add greeting to conversation
      setConversationHistory([
        { role: 'interviewer', content: greetingMsg },
      ]);

      // Speak the greeting
      setTimeout(() => {
        speakResponse(greetingMsg);
      }, 500);
    } catch (error) {
      console.error('Greeting error:', error);
      const fallbackGreeting = "Hey! Thanks for taking the time to chat with me. What's your name?";
      setConversationHistory([
        { role: 'interviewer', content: fallbackGreeting },
      ]);
      speakResponse(fallbackGreeting);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Speak the initial question when component mounts or question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length && !interviewComplete) {
      const currentQuestion = questions[currentQuestionIndex];
      const questionText = typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.question;
      if (questionText) {
        // Small delay to ensure synthesis is ready
        setTimeout(() => {
          speakResponse(questionText);
        }, 500);
      }
    }
  }, [currentQuestionIndex, questions, interviewComplete]);

  // Function to make AI speak with ElevenLabs for professional voice
  const speakResponse = async (text) => {
    try {
      addBreadcrumb(`Speaking: ${text.substring(0, 50)}...`, 'speech', 'info');

      // Try ElevenLabs first if enabled
      if (useElevenLabs && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
        try {
          const audioBuffer = await generateSpeech(text);
          if (audioBuffer) {
            playAudio(audioBuffer);
            return;
          }
        } catch (error) {
          console.error('ElevenLabs error, falling back to browser speech:', error);
          addBreadcrumb('ElevenLabs failed, using browser speech', 'speech', 'warning');
        }
      }

      // Fallback to browser speech synthesis
      if (!synthRef.current) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower pace for natural conversation
      utterance.pitch = 0.95; // Slightly lower pitch for warmth
      utterance.volume = 1;

      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        const naturalVoice = voices.find(v =>
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('female'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        utterance.voice = naturalVoice;
      }

      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
      captureException(error, {
        tags: { component: 'voice-interview', feature: 'speech' },
      });
    }
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        // Check if recognition is already running
        if (isListening) {
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        // Make sure to abort any pending recognition
        try {
          recognitionRef.current?.abort();
        } catch (e) {
          // Ignore abort errors
        }
        
        recognitionRef.current?.start();
        setIsMicOn(true);
      } catch (error) {
        console.error('Mic error:', error);
        alert('Failed to access microphone');
      }
    } else {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      try {
        recognitionRef.current?.abort();
      } catch (e) {
        // Ignore abort errors
      }
      setIsMicOn(false);
    }
  };

  const submitAnswer = async () => {
    if (!userTranscript.trim()) {
      alert('Please provide an answer');
      return;
    }

    setLoading(true);

    try {
      // Log this action for Sentry
      addBreadcrumb(`Submitted answer: ${userTranscript.substring(0, 50)}...`, 'user-action', 'info');

      // Handle greeting phase - get candidate name
      if (interviewPhase === 'greeting') {
        const name = userTranscript.trim();
        setCandidateName(name);
        
        // Set user context in Sentry
        setUser({ id: 'interview-' + Date.now(), name, email: null });

        // Add user response to conversation
        setConversationHistory((prev) => [
          ...prev,
          { role: 'candidate', content: name },
        ]);

        // Get personal intro message
        const personalResponse = await fetch('/api/interview/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phase: 'personal_intro',
            name: name,
            company: company,
            jobTitle: job.title,
          }),
        });

        if (!personalResponse.ok) {
          throw new Error(`API error: ${personalResponse.status}`);
        }

        let personalData = {};
        try {
          personalData = await personalResponse.json();
        } catch (e) {
          console.error('JSON parse error:', e);
          captureException(e, {
            tags: { phase: 'personal_intro', section: 'greeting' },
            extra: { userTranscript },
          });
          personalData = { response: null };
        }

        const personalMsg = personalData.response || `That's such a great name! So ${name}, tell me... what really drew you to this ${job.title} position at ${company}? I'm genuinely curious about your story here!`;

        // Add personal intro to conversation
        setConversationHistory((prev) => [
          ...prev,
          { role: 'interviewer', content: personalMsg },
        ]);

        // Speak the personal intro
        speakResponse(personalMsg);

        // Move to personal phase
        setInterviewPhase('personal');
        setUserTranscript('');
        setLoading(false);
        return;
      }

      // Handle personal phase - brief conversation before questions
      if (interviewPhase === 'personal') {
        // Add user response to conversation
        setConversationHistory((prev) => [
          ...prev,
          { role: 'candidate', content: userTranscript },
        ]);

        // Get a warm closing to transition to questions
        const transitionMsg = `That's wonderful, ${candidateName}! I really appreciate you sharing that. Alright, let's jump into some questions so I can learn more about how you'd approach things. Ready?`;

        // Add transition message
        setConversationHistory((prev) => [
          ...prev,
          { role: 'interviewer', content: transitionMsg },
        ]);

        // Speak transition
        speakResponse(transitionMsg);

        // Move to questions phase after a moment
        setTimeout(() => {
          setInterviewPhase('questions');
          setCurrentQuestionIndex(0);
          setUserTranscript('');
          setLoading(false);
          
          // Cancel speech and trigger first question
          if (synthRef.current) {
            synthRef.current.cancel();
          }
        }, 1500);
        return;
      }

      // Handle questions phase - regular interview Q&A
      const currentQuestion = questions[currentQuestionIndex];
      const questionText = typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.question;

      // Step 1: Analyze the answer
      console.log('[Voice Interview] Analyzing answer...');
      const analysisResponse = await fetch('/api/interview/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: `${company}-${job.title}`.toLowerCase().replace(/\s+/g, '-'),
          question: questionText,
          userResponse: userTranscript,
          questionIndex: currentQuestionIndex + 1,
          totalQuestions: questions.length,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis API error: ${analysisResponse.status}`);
      }

      let analysisData = {};
      try {
        analysisData = await analysisResponse.json();
      } catch (e) {
        console.error('Analysis JSON parse error:', e);
        analysisData = { analysis: { score: 50, strengths: [], weaknesses: [], followUp: "Tell me more." } };
      }

      const answerAnalysis = analysisData.analysis || { score: 50, strengths: [], weaknesses: [], followUp: "Tell me more." };

      console.log('[Voice Interview] Analysis:', answerAnalysis);

      // Add user message to conversation
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userTranscript },
      ];

      // Step 2: Get feedback based on analysis
      console.log('[Voice Interview] Getting feedback...');
      const feedbackResponse = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: `${company}-${job.title}`.toLowerCase().replace(/\s+/g, '-'),
          question: questionText,
          userResponse: userTranscript,
          questionIndex: currentQuestionIndex + 1,
          totalQuestions: questions.length,
          conversationHistory: updatedHistory,
          answerScore: answerAnalysis.score,
          strengths: answerAnalysis.strengths,
          weaknesses: answerAnalysis.weaknesses,
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error(`Feedback API error: ${feedbackResponse.status}`);
      }

      let feedbackData = {};
      try {
        feedbackData = await feedbackResponse.json();
      } catch (e) {
        console.error('Feedback JSON parse error:', e);
        feedbackData = { response: answerAnalysis.followUp || "You know what, that's honestly interesting. Tell me more about your thinking here." };
      }

      const aiResponse = feedbackData.response || answerAnalysis.followUp || "You know what, that's honestly interesting. Tell me more about your thinking here.";

      // Add AI feedback to conversation
      const finalHistory = [
        ...updatedHistory,
        { role: 'interviewer', content: aiResponse },
      ];
      setConversationHistory(finalHistory);

      // Show answer analysis briefly before moving on
      console.log('[Voice Interview] Answer Score:', answerAnalysis.score);
      console.log('[Voice Interview] Strengths:', answerAnalysis.strengths);
      console.log('[Voice Interview] Weaknesses:', answerAnalysis.weaknesses);

      // First, make AI repeat your answer back with emotional acknowledgment
      const confirmationMsg = `Got it, ${candidateName || 'there'}... so you said: "${userTranscript}". That's really interesting! Let me share some thoughts on that.`;
      speakResponse(confirmationMsg);

      // Wait a moment, then speak the feedback
      setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
        speakResponse(aiResponse);
      }, 2500);

      // Move to next question or complete - don't wait for speech to finish
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question after feedback speech finishes
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setUserTranscript('');
          setLoading(false);
          
          // Cancel ongoing speech so new question starts
          if (synthRef.current) {
            synthRef.current.cancel();
          }
        }, 5000); // Wait for confirmation + feedback to finish
      } else {
        // Interview is complete - get final comprehensive analysis
        setTimeout(async () => {
          try {
            const finalAnalyzeResponse = await fetch('/api/interview/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roleId: `${company}-${job.title}`.toLowerCase().replace(/\s+/g, '-'),
                questions: questions,
                responses: userTranscript,
                currentQuestion: questions[currentQuestionIndex],
              }),
            });

            if (!finalAnalyzeResponse.ok) {
              throw new Error(`Final analyze API error: ${finalAnalyzeResponse.status}`);
            }

            let finalAnalysisData = {};
            try {
              finalAnalysisData = await finalAnalyzeResponse.json();
            } catch (e) {
              console.error('Final analyze JSON parse error:', e);
              finalAnalysisData = { 
                overallScore: 65,
                summary: "Interview complete. Great effort today!",
                recommendations: [],
              };
            }

            setAnalysis(finalAnalysisData);
            setInterviewComplete(true);
          } catch (error) {
            console.error('Final analysis error:', error);
            setAnalysis({ 
              overallScore: 65,
              summary: "Interview complete. Great effort today!",
              recommendations: [],
            });
            setInterviewComplete(true);
          } finally {
            setLoading(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Interview error:', error);
      // Capture error in Sentry
      captureException(error, {
        tags: { component: 'voice-interview', phase: interviewPhase },
        extra: { 
          question: questions[currentQuestionIndex],
          transcript: userTranscript.substring(0, 100),
        },
      });
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  if (interviewComplete && analysis) {
    return (
      <div className="min-h-screen bg-black">
        <div className="border-b border-gray-800 sticky top-0 z-40 bg-black/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Interview Complete</h1>
              <p className="text-gray-400">{company} - {job.title}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Overall Score */}
          <Card className="border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400">{analysis.overallScore}/100</div>
                <p className="text-gray-300 mt-2 text-lg">{analysis.overallFeedback}</p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-gray-700 bg-gray-900/50 mb-6">
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
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          </div>

          {/* Closing */}
          <Card className="border-blue-700/50 bg-blue-900/20 mb-6">
            <CardContent className="pt-6">
              <p className="text-lg text-blue-200 italic">"{analysis.closingLine}"</p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={onComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Back to Interviews
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1 border-gray-700"
            >
              Take Another Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Interview with AI</h1>
            <p className="text-gray-400">{company} - {job.title}</p>
            <p className="text-gray-500 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <Button
            onClick={onBack}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Interview Area - Google Meet Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Interviewer Side (AI) - Left */}
        <div className="flex-1 border-r border-gray-800 bg-gray-900/30 p-8 flex flex-col justify-center items-center">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Volume2 className="h-16 w-16 text-white opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">AI Interviewer</h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                {typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.question}
              </p>
            </div>
            <p className="text-gray-400 text-sm">Listening to your response...</p>
          </div>
        </div>

        {/* User Side (Candidate) - Right */}
        <div className="flex-1 bg-black p-8 flex flex-col">
          <div className="flex-1 flex flex-col">
            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
              {conversationHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-center">
                    Click "Start Speaking" and answer the question
                  </p>
                </div>
              ) : (
                conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' || msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user' || msg.role === 'candidate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={conversationEndRef} />
            </div>

            {/* Current User Response */}
            {userTranscript && (
              <div className="mb-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Your response:</p>
                <p className="text-white">{userTranscript}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4 items-center">
              <Button
                onClick={toggleMic}
                size="lg"
                className={`flex-1 ${
                  isMicOn
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
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
                onClick={submitAnswer}
                disabled={!userTranscript.trim() || loading}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {currentQuestionIndex === questions.length - 1
                      ? 'Finish & Analyze'
                      : 'Next Question'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Progress</span>
              <span className="text-gray-400 text-sm">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
