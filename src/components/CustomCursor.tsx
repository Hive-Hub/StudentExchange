import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'interactive' | 'text' | 'canvas3d';

const TRAIL_COUNT = 10;

/**
 * Custom desktop cursor for (hover: hover) and (pointer: fine) devices.
 * Automatically disables on touch screens and when prefers-reduced-motion is set.
 * Preserves native text cursors on form fields while syncing visual indicators.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateSupport = () => {
      const active = finePointerMq.matches && !reducedMotionMq.matches;
      setEnabled(active);
      document.documentElement.classList.toggle('custom-cursor-active', active);
    };

    evaluateSupport();
    finePointerMq.addEventListener('change', evaluateSupport);
    reducedMotionMq.addEventListener('change', evaluateSupport);

    return () => {
      finePointerMq.removeEventListener('change', evaluateSupport);
      reducedMotionMq.removeEventListener('change', evaluateSupport);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isDown = false;
    let variant: CursorVariant = 'default';
    let rafId = 0;

    // Pre-allocated trail coordinates for zero per-frame allocations
    const trailX = new Float32Array(TRAIL_COUNT).fill(-100);
    const trailY = new Float32Array(TRAIL_COUNT).fill(-100);

    // Track active magnetic elements within ~80px of cursor
    let magneticNodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-magnetic]')
    );

    const refreshMagneticNodes = () => {
      magneticNodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-magnetic]')
      );
    };

    const observer = new MutationObserver(refreshMagneticNodes);
    observer.observe(document.body, { childList: true, subtree: true });

    const applyVisualState = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!dot || !ring || !label) return;

      const opacityVal = isVisible ? '1' : '0';
      dot.style.opacity = opacityVal;
      ring.style.opacity = opacityVal;

      if (variant === 'canvas3d') {
        ring.style.width = '70px';
        ring.style.height = '70px';
        ring.style.borderRadius = '9999px';
        ring.style.borderColor = 'rgba(34, 211, 238, 0.85)';
        ring.style.backgroundColor = 'rgba(7, 11, 26, 0.55)';
        ring.style.boxShadow = '0 0 24px rgba(34, 211, 238, 0.28)';
        ring.style.mixBlendMode = 'normal';
        dot.style.opacity = '0';
        label.style.opacity = '1';
        label.textContent = isDown ? 'Drag' : 'Explore';
      } else if (variant === 'text') {
        ring.style.width = '3px';
        ring.style.height = '24px';
        ring.style.borderRadius = '2px';
        ring.style.borderColor = 'rgba(34, 211, 238, 0.9)';
        ring.style.backgroundColor = 'rgba(34, 211, 238, 0.85)';
        ring.style.boxShadow = 'none';
        ring.style.mixBlendMode = 'normal';
        dot.style.opacity = '0';
        label.style.opacity = '0';
      } else if (variant === 'interactive') {
        const size = isDown ? 46 : 58;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
        ring.style.borderRadius = '9999px';
        ring.style.borderColor = 'rgba(34, 211, 238, 0.9)';
        ring.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
        ring.style.boxShadow = '0 0 22px rgba(59, 130, 246, 0.35)';
        ring.style.mixBlendMode = 'difference';
        label.style.opacity = '0';
      } else {
        const size = isDown ? 28 : 36;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
        ring.style.borderRadius = '9999px';
        ring.style.borderColor = 'rgba(34, 211, 238, 0.72)';
        ring.style.backgroundColor = 'transparent';
        ring.style.boxShadow = '0 0 12px rgba(34, 211, 238, 0.14)';
        ring.style.mixBlendMode = 'normal';
        label.style.opacity = '0';
      }
    };

    const detectTargetVariant = (target: EventTarget | null): CursorVariant => {
      if (!(target instanceof Element)) return 'default';
      if (target.closest('[data-cursor="3d"]')) return 'canvas3d';
      if (
        target.closest(
          'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]'
        )
      ) {
        return 'text';
      }
      if (target.closest('a, button, [role="button"], [role="tab"]')) {
        return 'interactive';
      }
      return 'default';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        ringX = mouseX;
        ringY = mouseY;
        trailX.fill(mouseX);
        trailY.fill(mouseY);
        isVisible = true;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      const nextVariant = detectTargetVariant(e.target);
      if (nextVariant !== variant) {
        variant = nextVariant;
        applyVisualState();
      } else {
        applyVisualState();
      }

      // Subtle magnetic shift for hero CTA buttons within ~80px radius
      for (let i = 0; i < magneticNodes.length; i++) {
        const el = magneticNodes[i];
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(80, Math.min(rect.width, 140) * 0.75);

        if (dist < radius) {
          const factor = (1 - dist / radius) * 0.24;
          const shiftX = Math.max(-8, Math.min(8, dx * factor));
          const shiftY = Math.max(-6, Math.min(6, dy * factor));
          el.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
        } else if (el.style.transform) {
          el.style.transform = '';
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      isDown = true;
      applyVisualState();
    };

    const handlePointerUp = () => {
      isDown = false;
      applyVisualState();
    };

    const handlePointerLeave = () => {
      isVisible = false;
      applyVisualState();
      magneticNodes.forEach((el) => {
        if (el.style.transform) el.style.transform = '';
      });
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      // Update short low-opacity glow particle trail
      let prevX = mouseX;
      let prevY = mouseY;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        trailX[i] += (prevX - trailX[i]) * (0.42 - i * 0.02);
        trailY[i] += (prevY - trailY[i]) * (0.42 - i * 0.02);
        prevX = trailX[i];
        prevY = trailY[i];

        const node = trailRefs.current[i];
        if (node) {
          const showTrail = isVisible && variant !== 'text';
          const progress = 1 - i / TRAIL_COUNT;
          node.style.opacity = showTrail ? (progress * 0.28).toFixed(3) : '0';
          node.style.transform = `translate3d(${trailX[i]}px, ${trailY[i]}px, 0) translate(-50%, -50%) scale(${(0.35 + progress * 0.65).toFixed(2)})`;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
      magneticNodes.forEach((el) => {
        if (el.style.transform) el.style.transform = '';
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {/* Subtle fading particle glow trail behind cursor */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#22D3EE] pointer-events-none will-change-transform opacity-0"
        />
      ))}

      {/* Outer lerped ring (36px default) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-[#22D3EE]/70 flex items-center justify-center pointer-events-none will-change-transform opacity-0 transition-[width,height,border-radius,background-color,border-color,box-shadow,opacity] duration-150 ease-out"
      >
        <span
          ref={labelRef}
          className="text-[11px] font-semibold tracking-wide text-[#22D3EE] select-none opacity-0 transition-opacity duration-150"
        />
      </div>

      {/* Instant 8px precision dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none will-change-transform opacity-0 transition-opacity duration-150"
      />
    </div>
  );
}
