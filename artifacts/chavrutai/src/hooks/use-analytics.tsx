import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Retain navigation scroll behavior; Replit handles pageview tracking.
      // Scroll to top on page navigation unless there's an anchor tag
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
      
      prevLocationRef.current = location;
    }
  }, [location]);
};