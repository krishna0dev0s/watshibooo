// Advanced Interview Metrics & Analytics API Route
import { AdvancedSentry } from '@/lib/sentry-advanced';

const { InterviewMetrics, BehaviorTracker, SessionAnalytics } = AdvancedSentry;

// Store active interviews in memory (use Redis for production)
const activeInterviews = new Map();

export async function POST(request) {
  try {
    const { action, interviewId, data } = await request.json();

    switch (action) {
      case 'start': {
        // Initialize new interview metrics
        const metrics = new InterviewMetrics(interviewId);
        activeInterviews.set(interviewId, {
          metrics,
          startTime: Date.now(),
          answers: [],
        });

        SessionAnalytics.startSession(data?.candidateId, 'interview');
        BehaviorTracker.trackUserAction('Interview started', { interviewId });

        return Response.json({
          success: true,
          message: 'Interview metrics initialized',
          interviewId,
        });
      }

      case 'track-phase': {
        // Track interview phases
        const interview = activeInterviews.get(interviewId);
        if (!interview) {
          return Response.json(
            { error: 'Interview not found' },
            { status: 404 }
          );
        }

        if (data.phase === 'end') {
          interview.metrics.trackPhaseEnd();
        } else {
          interview.metrics.trackPhaseStart(data.phase);
        }

        BehaviorTracker.trackUserAction('Phase tracked', {
          interviewId,
          phase: data.phase,
        });

        return Response.json({ success: true });
      }

      case 'track-answer': {
        // Track interview answer with quality metrics
        const interview = activeInterviews.get(interviewId);
        if (!interview) {
          return Response.json(
            { error: 'Interview not found' },
            { status: 404 }
          );
        }

        const {
          questionId,
          answer,
          duration,
          confidence,
          sentiment,
          speakingTime,
        } = data;

        // Track metrics
        interview.metrics.trackSpeaking(speakingTime || duration);
        interview.metrics.trackAnswerQuality(confidence);

        if (duration) {
          interview.metrics.trackAPILatency('answer-response-time', duration);
        }

        if (sentiment) {
          interview.metrics.trackError(
            new Error(`Sentiment: ${sentiment}`),
            { phase: 'answer', sentiment }
          );
        }

        // Store answer
        interview.answers.push({
          questionId,
          answer: answer.substring(0, 500), // Truncate
          confidence,
          sentiment,
          duration,
          timestamp: Date.now(),
        });

        SessionAnalytics.trackEvent('answer_submitted', {
          question_id: questionId,
          confidence,
          sentiment,
          duration,
        });

        BehaviorTracker.trackUserAction('Answer tracked', {
          interviewId,
          questionId,
          confidence,
          sentiment,
        });

        return Response.json({
          success: true,
          answerCount: interview.answers.length,
        });
      }

      case 'track-error': {
        // Track errors that occur during interview
        const interview = activeInterviews.get(interviewId);
        if (!interview) {
          return Response.json(
            { error: 'Interview not found' },
            { status: 404 }
          );
        }

        const { errorType, errorMessage, phase } = data;

        interview.metrics.trackError(new Error(errorMessage), {
          phase,
          type: errorType,
        });

        BehaviorTracker.trackError(errorType, errorMessage, {
          interviewId,
          phase,
        });

        SessionAnalytics.trackEvent('error_occurred', {
          error_type: errorType,
          phase,
          recovered: data.recovered || false,
        });

        return Response.json({ success: true });
      }

      case 'get-report': {
        // Get interview report
        const interview = activeInterviews.get(interviewId);
        if (!interview) {
          return Response.json(
            { error: 'Interview not found' },
            { status: 404 }
          );
        }

        const report = interview.metrics.getReport();
        const duration = Date.now() - interview.startTime;

        return Response.json({
          success: true,
          report: {
            ...report,
            totalDuration: duration,
            answerCount: interview.answers.length,
            answers: interview.answers,
            averageConfidence:
              interview.answers.length > 0
                ? (
                    interview.answers.reduce((sum, a) => sum + a.confidence, 0) /
                    interview.answers.length
                  ).toFixed(3)
                : 0,
            sentimentBreakdown: calculateSentimentBreakdown(interview.answers),
          },
        });
      }

      case 'end': {
        // End interview and generate final report
        const interview = activeInterviews.get(interviewId);
        if (!interview) {
          return Response.json(
            { error: 'Interview not found' },
            { status: 404 }
          );
        }

        const report = interview.metrics.getReport();
        const duration = Date.now() - interview.startTime;
        const finalReport = {
          interviewId,
          candidateId: data?.candidateId,
          jobTitle: data?.jobTitle,
          duration,
          completedAt: new Date().toISOString(),
          metrics: {
            totalPhases: Object.keys(report.phases).length,
            totalQuestions: interview.answers.length,
            averageConfidence:
              interview.answers.length > 0
                ? (
                    interview.answers.reduce((sum, a) => sum + a.confidence, 0) /
                    interview.answers.length
                  ).toFixed(3)
                : 0,
            totalSpeakingTime: report.totalSpeakingTime,
            totalListeningTime: report.totalListeningTime,
            apiLatencies: report.apiLatencies,
            answerQualities: report.answerQualities,
          },
          sentiment: calculateSentimentBreakdown(interview.answers),
          answers: interview.answers,
          errors: report.errors || [],
        };

        // Clean up
        activeInterviews.delete(interviewId);

        // End session
        SessionAnalytics.endSession();

        // Track completion
        BehaviorTracker.trackUserAction('Interview completed', {
          interviewId,
          duration,
          questions: interview.answers.length,
        });

        return Response.json({
          success: true,
          report: finalReport,
        });
      }

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    BehaviorTracker.trackError('INTERVIEW_METRICS_ERROR', error.message);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

// Helper function to calculate sentiment breakdown
function calculateSentimentBreakdown(answers) {
  const breakdown = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  answers.forEach(answer => {
    if (answer.sentiment) {
      breakdown[answer.sentiment]++;
    }
  });

  return {
    ...breakdown,
    total: answers.length,
    percentages: {
      positive: ((breakdown.positive / answers.length) * 100).toFixed(2),
      negative: ((breakdown.negative / answers.length) * 100).toFixed(2),
      neutral: ((breakdown.neutral / answers.length) * 100).toFixed(2),
    },
  };
}
