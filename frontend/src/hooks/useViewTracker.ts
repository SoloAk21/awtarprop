import { useEffect, useRef } from "react";
import { apiClient } from "../api/client.js";

/**
 * Tracks property post visibility and debounces view count updates.
 */
export function useViewTracker(propertyId: string) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!propertyId || hasTrackedRef.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !hasTrackedRef.current) {
          // Wait 1.5s to confirm genuine user viewing before calling API
          timer = setTimeout(() => {
            if (!hasTrackedRef.current) {
              hasTrackedRef.current = true;
              apiClient.post(`/properties/${propertyId}/view`).catch(() => {
                // Silent fail for analytics
              });
            }
          }, 1500);
        } else if (!entry.isIntersecting && timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.6 }, // Element must be 60% visible
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [propertyId]);

  return elementRef;
}
