import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

/**
 * Hook to prevent navigation when there are unsaved changes
 * Handles both browser navigation (refresh, close tab) and in-app navigation
 */
export function useUnsavedChanges({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseUnsavedChangesProps) {
  const messageRef = useRef(message);

  // Update message ref when message changes
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Block in-app navigation using React Router's useBlocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  // Handle browser navigation (refresh, close tab, back/forward buttons)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // Modern browsers ignore the custom message and show their own
        event.returnValue = messageRef.current;
        return messageRef.current;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return {
    blocker,
    // Helper function to proceed with blocked navigation
    proceedNavigation: () => {
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
    },
    // Helper function to reset/cancel blocked navigation
    resetNavigation: () => {
      if (blocker.state === 'blocked') {
        blocker.reset();
      }
    },
  };
}
