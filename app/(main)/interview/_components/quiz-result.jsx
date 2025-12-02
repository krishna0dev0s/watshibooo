"use client";

import { Trophy, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 animate-fadeIn py-8">
      <div className="flex items-center justify-between mb-12 px-4">
        {/* Score Overview */}
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${result.quizScore}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{result.quizScore.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-white/50">Final Score</div>
            <div className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> Quiz Complete
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Tip */}
      {result.improvementTip && (
        <div className="mb-10 px-4">
          <div className="border border-white/10 rounded-lg p-6 bg-white/5">
            <div className="flex items-start gap-3 text-sm">
              <span className="mt-0.5">💡</span>
              <p className="text-white/70 leading-relaxed">{result.improvementTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Questions Review */}
      <div className="space-y-6">
        {result.questions.map((q, index) => (
          <div 
            key={index} 
            className="border border-white/10 rounded-lg p-6 bg-white/5"
          >
            <div className="flex items-start gap-4">
              <div 
                className={`mt-0.5 p-1.5 rounded-md
                  ${q.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}
              >
                {q.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="font-medium text-white/90">{q.question}</p>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-[100px,1fr] gap-2 items-baseline">
                    <span className="text-white/50">Your answer:</span>
                    <span className={q.isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {q.userAnswer}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="grid grid-cols-[100px,1fr] gap-2 items-baseline">
                      <span className="text-white/50">Correct:</span>
                      <span className="text-green-400">{q.answer}</span>
                    </div>
                  )}
                </div>
                
                {q.explanation && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm text-white/60 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hideStartNew && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <Button 
            onClick={onStartNew} 
            className="w-full py-6 font-medium bg-white/10 hover:bg-white/15"
          >
            Start New Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
