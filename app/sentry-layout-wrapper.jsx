import { initSentry } from '@/lib/sentry-client';

// Initialize Sentry on app load
if (typeof window !== 'undefined') {
  initSentry();
  console.log('✅ Sentry initialized for error tracking');
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Watshiboo - Interview Platform</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
