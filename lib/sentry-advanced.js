// Advanced Sentry Features - Complete Monitoring & Analytics
import * as Sentry from "@sentry/nextjs";

// Initialize advanced Sentry with all features
export function initAdvancedSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0, // Profile all transactions
    debug: process.env.NODE_ENV === 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Advanced integrations
    integrations: [
      Sentry.httpClientIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
      Sentry.captureConsoleIntegration({
        levels: ['error', 'warn'],
      }),
      Sentry.anrIntegration(),
    ],

    // Performance monitoring
    replaysSessionSampleRate: 0.2, // 20% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    maxBreadcrumbs: 100,

    // Ignore certain errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'Network request failed',
      'AbortError',
    ],

    // Before sending event (filter/modify)
    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 'NETWORK_ERROR') {
            return null; // Don't send network errors
          }
        }
      }
      return event;
    },

    // Transport options
    transportOptions: {
      timeout: 5000,
    },
  });
}

// Advanced performance monitoring
export class PerformanceMonitor {
  static trackTransaction(name, operation) {
    const startTime = Date.now();

    return {
      startTime,
      end: () => {
        const duration = Date.now() - startTime;
        Sentry.addBreadcrumb({
          message: `Transaction completed: ${name}`,
          category: 'performance',
          level: 'info',
          data: { duration, operation },
        });
      },
      addSpan: (spanName, spanOp) => {
        const spanStart = Date.now();
        return {
          finish: () => {
            const spanDuration = Date.now() - spanStart;
            Sentry.addBreadcrumb({
              message: `Span: ${spanName}`,
              category: 'span',
              level: 'debug',
              data: { duration: spanDuration, operation: spanOp },
            });
          },
        };
      },
    };
  }

  static measureFunction(fn, name) {
    return async (...args) => {
      const monitor = PerformanceMonitor.trackTransaction(name, 'function');
      try {
        const result = await fn(...args);
        monitor.end();
        return result;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: name },
        });
        monitor.end();
        throw error;
      }
    };
  }

  static trackAPICall(method, url, statusCode, duration) {
    Sentry.addBreadcrumb({
      message: `${method} ${url}`,
      category: 'api',
      level: statusCode >= 400 ? 'warning' : 'info',
      data: {
        statusCode,
        duration: `${duration}ms`,
      },
    });
  }
}

// Interview metrics tracking
export class InterviewMetrics {
  constructor(interviewId) {
    this.interviewId = interviewId;
    this.startTime = Date.now();
    this.metrics = {
      greatingTime: 0,
      personalTime: 0,
      questionTimes: [],
      answerQualities: [],
      speakingDurations: [],
      listeningDurations: [],
      apiLatencies: [],
      errors: [],
    };
  }

  trackPhaseStart(phase) {
    this.currentPhase = phase;
    this.phaseStartTime = Date.now();
    Sentry.addBreadcrumb({
      message: `Interview phase started: ${phase}`,
      category: 'interview',
      level: 'info',
      data: { interviewId: this.interviewId },
    });
  }

  trackPhaseEnd() {
    const duration = Date.now() - this.phaseStartTime;
    if (this.currentPhase === 'greeting') {
      this.metrics.greatingTime = duration;
    } else if (this.currentPhase === 'personal') {
      this.metrics.personalTime = duration;
    } else if (this.currentPhase === 'questions') {
      this.metrics.questionTimes.push(duration);
    }
  }

  trackAnswerQuality(score) {
    this.metrics.answerQualities.push(score);
  }

  trackSpeaking(duration) {
    this.metrics.speakingDurations.push(duration);
  }

  trackListening(duration) {
    this.metrics.listeningDurations.push(duration);
  }

  trackAPILatency(apiName, latency) {
    this.metrics.apiLatencies.push({ api: apiName, latency });
    Sentry.addBreadcrumb({
      message: `API latency: ${apiName}`,
      category: 'performance',
      level: latency > 2000 ? 'warning' : 'info',
      data: { latency: `${latency}ms` },
    });
  }

  trackError(error, context) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      context,
    });
    Sentry.captureException(error, {
      tags: { interviewId: this.interviewId },
      extra: { context, phase: this.currentPhase },
    });
  }

  getReport() {
    const totalTime = Date.now() - this.startTime;
    const avgAnswerQuality = this.metrics.answerQualities.length > 0
      ? this.metrics.answerQualities.reduce((a, b) => a + b, 0) / this.metrics.answerQualities.length
      : 0;

    const avgAPILatency = this.metrics.apiLatencies.length > 0
      ? this.metrics.apiLatencies.reduce((sum, item) => sum + item.latency, 0) / this.metrics.apiLatencies.length
      : 0;

    const report = {
      interviewId: this.interviewId,
      totalDuration: totalTime,
      phases: {
        greeting: this.metrics.greatingTime,
        personal: this.metrics.personalTime,
        questions: this.metrics.questionTimes,
      },
      quality: {
        averageAnswerScore: parseFloat(avgAnswerQuality.toFixed(2)),
        totalAnswers: this.metrics.answerQualities.length,
      },
      timing: {
        totalSpeakingTime: this.metrics.speakingDurations.reduce((a, b) => a + b, 0),
        totalListeningTime: this.metrics.listeningDurations.reduce((a, b) => a + b, 0),
        averageAPILatency: parseFloat(avgAPILatency.toFixed(2)),
      },
      errors: this.metrics.errors.length,
    };

    // Log full report to Sentry
    Sentry.addBreadcrumb({
      message: 'Interview completed - Full metrics report',
      category: 'interview',
      level: 'info',
      data: report,
    });

    return report;
  }
}

// User behavior tracking
export class BehaviorTracker {
  static trackUserAction(action, details = {}) {
    Sentry.addBreadcrumb({
      message: action,
      category: 'user-action',
      level: 'info',
      data: details,
      timestamp: Date.now() / 1000,
    });
  }

  static trackPageView(pageName) {
    Sentry.addBreadcrumb({
      message: `Page viewed: ${pageName}`,
      category: 'navigation',
      level: 'info',
    });
  }

  static trackUserInteraction(interactionType, target, details = {}) {
    Sentry.addBreadcrumb({
      message: `${interactionType} on ${target}`,
      category: 'interaction',
      level: 'info',
      data: details,
    });
  }

  static trackError(errorType, message, context = {}) {
    const error = new Error(message);
    Sentry.captureException(error, {
      tags: { errorType },
      extra: context,
      level: 'error',
    });
  }
}

// Advanced error handling with recovery
export function handleErrorWithRecovery(error, fallbackFn, context = {}) {
  // Log the error
  Sentry.captureException(error, {
    tags: { recovery: 'attempted' },
    extra: context,
  });

  // Add breadcrumb before recovery attempt
  Sentry.addBreadcrumb({
    message: 'Attempting error recovery',
    category: 'recovery',
    level: 'warning',
    data: { error: error.message, ...context },
  });

  try {
    // Try recovery function
    const result = fallbackFn();
    
    Sentry.addBreadcrumb({
      message: 'Error recovery successful',
      category: 'recovery',
      level: 'info',
    });

    return result;
  } catch (recoveryError) {
    // Recovery failed
    Sentry.captureException(recoveryError, {
      tags: { recovery: 'failed' },
      extra: { originalError: error.message, ...context },
    });

    throw new Error(`Recovery failed: ${recoveryError.message}`);
  }
}

// Session analytics
export class SessionAnalytics {
  static startSession(userId, sessionData = {}) {
    Sentry.setUser({
      id: userId,
      ...sessionData,
    });

    Sentry.addBreadcrumb({
      message: 'Session started',
      category: 'session',
      level: 'info',
      data: sessionData,
    });
  }

  static endSession(endData = {}) {
    Sentry.addBreadcrumb({
      message: 'Session ended',
      category: 'session',
      level: 'info',
      data: endData,
    });

    Sentry.setUser(null);
  }

  static trackSessionEvent(eventName, eventData = {}) {
    Sentry.addBreadcrumb({
      message: eventName,
      category: 'session-event',
      level: 'info',
      data: eventData,
    });
  }
}

// Export all utilities
export const AdvancedSentry = {
  init: initAdvancedSentry,
  PerformanceMonitor,
  InterviewMetrics,
  BehaviorTracker,
  handleErrorWithRecovery,
  SessionAnalytics,
};
