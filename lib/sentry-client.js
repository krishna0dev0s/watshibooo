import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // See http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'Can\'t find variable: ZiteReader',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // Random plugins/extensions
      'conduitPage',
      // See http://stackoverflow.com/questions/19033766/js-error-despite-these-lines-in-the-htmlhead-why-still-getting-js-error
      'Unexpected end of JSON input',
    ],

    // Performance monitoring
    beforeSend(event, hint) {
      // Filter out certain errors
      if (event.exception) {
        const error = hint.originalException;
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          error.message.includes('Network request failed')
        ) {
          return null;
        }
      }
      return event;
    },

    // Integrations
    integrations: [
      Sentry.httpClientIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  });
}

// Capture exceptions manually
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
  });
}

// Capture messages
export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}

// Set user context
export function setUser(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Add breadcrumb
export function addBreadcrumb(message, category = 'user-action', level = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

// Start transaction for performance monitoring (use startNewTrace for correct API)
export function startTransaction(name, op = 'http.client') {
  // For Sentry v7/v8, use the profiler or transaction API differently
  const transaction = {
    name,
    op,
    startTime: Date.now(),
  };
  return transaction;
}
