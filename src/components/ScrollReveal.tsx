import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Progressive fade-up reveal using IntersectionObserver for below-the-fold sections.
 * Content in or above the viewport on mount is immediately visible so nothing
 * ever remains hidden at opacity 0. Respects prefers-reduced-motion.
 */
export function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setRevealed(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    // Elements already near or inside viewport stay immediately visible
    if (rect.top < window.innerHeight * 0.92) {
      setRevealed(true);
      return;
    }

    setRevealed(false);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.04, rootMargin: '80px 0px' }
    );

    observer.observe(el);

    // Fallback safety timer in case an edge browser skips observer callback
    const safetyTimer = window.setTimeout(() => {
      setRevealed(true);
    }, 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out will-change-transform ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}
