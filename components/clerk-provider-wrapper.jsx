'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useEffect, useState } from 'react';

export function ClerkProviderWrapper({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give Clerk 5 seconds to load, then continue anyway
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      afterSignOutUrl="/"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
