import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  to: string;
  value: string;
  label: string;
  note: string;
  icon: LucideIcon;
  accentColor: string;
  iconBgClass: string;
  iconTextClass: string;
  hoverBorderClass: string;
}

/** Parses values like "140+" or "28" into { target: 140, suffix: "+" } */
function parseStatValue(raw: string): { target: number; suffix: string } | null {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const num = Number(match[1]);
  if (Number.isNaN(num)) return null;
  return { target: num, suffix: match[2] || '' };
}

/**
 * Reusable glassmorphism statistic card with IntersectionObserver-triggered
 * count-up animation, icon color-coding, and tabular numerals.
 */
export function StatCard({
  to,
  value,
  label,
  note,
  icon: Icon,
  iconBgClass,
  iconTextClass,
  hoverBorderClass,
}: StatCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const parsed = parseStatValue(value);
  const [displayValue, setDisplayValue] = useState<string>(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    hasAnimatedRef.current = false;
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !parsed) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let rafId = 0;

    const runCountUp = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      const durationMs = 900;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(parsed.target * eased);
        setDisplayValue(`${current}${parsed.suffix}`);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(value);
        }
      };

      setDisplayValue(`0${parsed.suffix}`);
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runCountUp();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [parsed, value]);

  return (
    <Link
      ref={cardRef}
      to={to}
      className={`group rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-md p-5 hover:bg-white/[0.08] ${hoverBorderClass} hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22D3EE]`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-3xl font-extrabold text-white tabular-nums tracking-tight">
          {displayValue}
        </p>
        <span
          className={`w-10 h-10 rounded-xl border inline-flex items-center justify-center shrink-0 ${iconBgClass} ${iconTextClass}`}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </span>
      </div>

      <p className="text-sm font-semibold text-white mt-3 flex items-center justify-between gap-2">
        <span>{label}</span>
        <ArrowRight
          className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-white group-hover:translate-x-0.5 transition-transform duration-150 shrink-0"
          aria-hidden="true"
        />
      </p>

      <p className="text-sm text-[#CBD5E1] mt-1 leading-snug">{note}</p>
    </Link>
  );
}
