"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  if (generatingQuiz) {
    return (
    <div className="flex items-center justify-center fixed inset-0" 
      style={{ 
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03), rgba(255, 255, 255, 0.05), rgba(6, 182, 212, 0.03))',
        backdropFilter: 'blur(4px)'
      }}>
      <BarLoader color="#7c3aed" width={150} height={4} />
    </div>
  );
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2 bg-card/30 border border-white/10 hover:bg-card/40 hover:border-white/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateQuizFn} 
            className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
            size="lg"
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2 bg-card/30 border border-white/10 hover:bg-card/40 hover:border-white/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Question {currentQuestion + 1} of {quizData.length}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {Math.round((currentQuestion / quizData.length) * 100)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xl font-medium leading-relaxed">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`option-${index}`}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer
                ${answers[currentQuestion] === option 
                  ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <span className="flex-1 text-base">
                {option}
              </span>
            </Label>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="font-medium text-lg mb-2">Explanation:</p>
            <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4 pt-6">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
            className="hover:bg-white/5 transition-all duration-300"
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
          size="lg"
        >
          {savingResult ? (
            <div className="flex items-center gap-2">
              <BarLoader color="#fff" width={50} height={2} />
              <span>Saving...</span>
            </div>
          ) : (
            currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
