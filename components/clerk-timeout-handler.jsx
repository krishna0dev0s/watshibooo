'use client';

import { useEffect } from 'react';

export function ClerkTimeoutHandler() {
  useEffect(() => {
    // Handle Clerk timeout by suppressing the error after 10 seconds
    const timeout = setTimeout(() => {
      // Remove Clerk timeout errors from console
      const style = document.createElement('style');
      style.innerHTML = `
        [data-clerk-error] { display: none !important; }
      `;
      document.head.appendChild(style);
    }, 10000);

    // Also add an event listener to catch and suppress Clerk errors
    const handleError = (event) => {
      if (event.message?.includes('Clerk') || event.message?.includes('failed_to_load_clerk')) {
        console.warn('[Clerk] Loading timeout - proceeding without authentication');
        event.preventDefault?.();
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
