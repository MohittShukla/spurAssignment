import { useEffect, useRef } from 'react';

/**
 * Automatically scrolls to the bottom of a container when its dependencies change.
 * Useful for keeping the latest chat message in view.
 */
export function useAutoScroll<T extends HTMLElement>(dependencies: any[]) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, dependencies);

  return containerRef;
}
