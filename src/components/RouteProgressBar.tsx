import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

export interface RouteProgressBarProps {
  /** Delay in ms before showing progress bar to prevent flicker on fast transitions (default: 120ms) */
  defaultPendingMs?: number;
  /** Minimum time in ms progress bar stays visible to avoid visual jitter (default: 350ms) */
  defaultPendingMinMs?: number;
}

export const RouteProgressBar: React.FC<RouteProgressBarProps> = ({
  defaultPendingMs = 120,
  defaultPendingMinMs = 350,
}) => {
  const location = useLocation();
  const isFetching = useIsFetching();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const shownTimestampRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const trickleIntervalRef = useRef<number | null>(null);
  const prevLocationRef = useRef(location.key);

  const startPending = () => {
    // Clear any pending hide or trickle timers
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // If already showing, do nothing or restart trickle
    if (visible) return;

    // Wait defaultPendingMs before making visible (Anti-flicker threshold)
    if (!pendingTimerRef.current) {
      pendingTimerRef.current = window.setTimeout(() => {
        setVisible(true);
        setProgress(25);
        shownTimestampRef.current = Date.now();
        pendingTimerRef.current = null;

        // Trickle progress slowly forward
        trickleIntervalRef.current = window.setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) return prev;
            return prev + Math.random() * 12;
          });
        }, 200);
      }, defaultPendingMs);
    }
  };

  const finishPending = () => {
    // If pending was cancelled before the anti-flicker threshold (120ms), cancel display entirely
    if (pendingTimerRef.current) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }

    if (trickleIntervalRef.current) {
      window.clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }

    if (!visible) {
      setProgress(0);
      shownTimestampRef.current = null;
      return;
    }

    // Ensure the bar stays visible for at least defaultPendingMinMs (350ms)
    const elapsedTime = shownTimestampRef.current ? Date.now() - shownTimestampRef.current : defaultPendingMinMs;
    const remainingTime = Math.max(0, defaultPendingMinMs - elapsedTime);

    hideTimerRef.current = window.setTimeout(() => {
      setProgress(100);

      // Fade out after reaching 100%
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
        shownTimestampRef.current = null;
        hideTimerRef.current = null;
      }, 250);
    }, remainingTime);
  };

  // Route change trigger
  useEffect(() => {
    if (prevLocationRef.current !== location.key) {
      prevLocationRef.current = location.key;
      startPending();
      // Route transitions in client-side router complete quickly, so schedule finish
      const routeFinishTimeout = window.setTimeout(() => {
        if (isFetching === 0) {
          finishPending();
        }
      }, 150);

      return () => {
        window.clearTimeout(routeFinishTimeout);
      };
    }
  }, [location.key]);

  // Query fetching trigger
  useEffect(() => {
    if (isFetching > 0) {
      startPending();
    } else {
      finishPending();
    }
  }, [isFetching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (trickleIntervalRef.current) window.clearInterval(trickleIntervalRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Cargando página y datos"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="route-progress-bar"
      style={{
        transform: `scaleX(${progress / 100})`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
};

export default RouteProgressBar;
