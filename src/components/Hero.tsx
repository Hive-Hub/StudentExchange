import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Cpu,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { StatCard, type StatCardProps } from './StatCard';
import type { PlatformStat } from '../types';

const LazyScene3D = lazy(() => import('./Scene3D'));

interface HeroProps {
  stats: PlatformStat[];
  loading: boolean;
}

const HERO_FALLBACK_IMAGE = '/src/assets/images/hero_student_makers_1795281326782.jpg';

/** Detects basic WebGL availability on client browsers */
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function sanitizeNote(note: string | undefined, fallback: string): string {
  if (!note) return fallback;
  const lower = note.toLowerCase();
  if (lower.includes('demo') || lower.includes('editable')) return fallback;
  return note;
}

const statPaletteMap: Record<
  string,
  {
    to: string;
    label: string;
    defaultValue: string;
    fallbackNote: string;
    icon: StatCardProps['icon'];
    accentColor: string;
    iconBgClass: string;
    iconTextClass: string;
    hoverBorderClass: string;
  }
> = {
  learning_resources: {
    to: '/learning',
    label: 'Learning Resources',
    defaultValue: '9',
    fallbackNote: 'Free courses & open tracks',
    icon: BookOpen,
    accentColor: 'var(--blue)',
    iconBgClass: 'bg-[#3B82F6]/15 border-[#3B82F6]/35',
    iconTextClass: 'text-[#60A5FA]',
    hoverBorderClass: 'hover:border-[#3B82F6]/60',
  },
  student_projects: {
    to: '/projects',
    label: 'Student Projects',
    defaultValue: '5',
    fallbackNote: 'Open-source student builds',
    icon: FolderGit2,
    accentColor: 'var(--violet)',
    iconBgClass: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/35',
    iconTextClass: 'text-[#A78BFA]',
    hoverBorderClass: 'hover:border-[#8B5CF6]/60',
  },
  hardware_listings: {
    to: '/explore',
    label: 'Hardware Exchange',
    defaultValue: '12+',
    fallbackNote: 'Boards, kits & campus gear',
    icon: Cpu,
    accentColor: 'var(--orange)',
    iconBgClass: 'bg-[#FB923C]/15 border-[#FB923C]/35',
    iconTextClass: 'text-[#FB923C]',
    hoverBorderClass: 'hover:border-[#FB923C]/60',
  },
  community_events: {
    to: '/community',
    label: 'Community Events',
    defaultValue: '7',
    fallbackNote: 'Workshops & live sessions',
    icon: CalendarDays,
    accentColor: 'var(--cyan)',
    iconBgClass: 'bg-[#22D3EE]/15 border-[#22D3EE]/35',
    iconTextClass: 'text-[#22D3EE]',
    hoverBorderClass: 'hover:border-[#22D3EE]/60',
  },
};

const orderedStatKeys = [
  'learning_resources',
  'student_projects',
  'hardware_listings',
  'community_events',
] as const;

export function Hero({ stats, loading }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const heroSectionRef = useRef<HTMLElement>(null);
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desktopMq = window.matchMedia('(min-width: 768px)');
    const syncViewport = () => setIsDesktopViewport(desktopMq.matches);
    syncViewport();
    setWebglReady(checkWebGLSupport());
    desktopMq.addEventListener('change', syncViewport);
    return () => desktopMq.removeEventListener('change', syncViewport);
  }, []);

  // Pause 3D rendering when scrolled past the hero to save GPU/battery
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsHeroVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showInteractive3D =
    isDesktopViewport && !prefersReducedMotion && webglReady && !contextLost;

  // Merge API stats cleanly into the 4 color-coded pillars
  const mergedStats: StatCardProps[] = useMemo(() => {
    const byKey = new Map(stats.map((item) => [item.stat_key, item]));
    return orderedStatKeys.map((key) => {
      const cfg = statPaletteMap[key];
      const live = byKey.get(key);
      return {
        to: cfg.to,
        value: live?.value || cfg.defaultValue,
        label: live?.label || cfg.label,
        note: sanitizeNote(live?.note, cfg.fallbackNote),
        icon: cfg.icon,
        accentColor: cfg.accentColor,
        iconBgClass: cfg.iconBgClass,
        iconTextClass: cfg.iconTextClass,
        hoverBorderClass: cfg.hoverBorderClass,
      };
    });
  }, [stats]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      ref={heroSectionRef}
      className="relative overflow-hidden bg-[var(--midnight)] text-white border-b border-white/10"
    >
      {/* Subtle radial glow (blue / violet) and faint technical dot/grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hero-grid-pattern"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 w-[540px] h-[540px] rounded-full opacity-30 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-[-10%] w-[560px] h-[560px] rounded-full opacity-28 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(34,211,238,0.18) 45%, transparent 72%)' }}
      />

      <div className="site-container relative z-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Staggered Copy, Magnetic CTAs & Trust Row */}
          <motion.div
            className="lg:col-span-6 flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center rounded-full border border-[#22D3EE]/35 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#22D3EE] backdrop-blur-sm">
                Free for students · Open to all
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display font-extrabold text-white tracking-tight mt-5 leading-[1.07] max-w-2xl"
              style={{ fontSize: 'clamp(2.35rem, 4.1vw, 3.85rem)' }}
            >
              Your Ideas Deserve a{' '}
              <span className="brand-gradient-text">Place to Grow</span>.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-[var(--text-on-dark)] mt-5 leading-relaxed max-w-[560px]"
            >
              Learn for free, trade unused electronics, join bootcamps, and build with peer-led communities.
            </motion.p>

            {/* Primary Orange & Secondary Glass Outline CTAs with subtle magnetic shift */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/learning"
                data-magnetic
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-[#070B1A] bg-[var(--orange)] hover:bg-[#FDBA74] rounded-xl shadow-[0_4px_18px_rgba(251,146,60,0.25)] hover:shadow-[0_0_30px_rgba(251,146,60,0.55)] transition-[background-color,box-shadow,transform] duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Explore Learning</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                to="/explore"
                data-magnetic
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-white/[0.08] border border-white/25 backdrop-blur-md hover:bg-white/[0.15] hover:border-[#22D3EE]/70 rounded-xl transition-[background-color,border-color,transform] duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22D3EE]"
              >
                <Cpu className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                <span>Browse Hardware</span>
              </Link>
            </motion.div>

            {/* Trust Row */}
            <motion.div
              variants={itemVariants}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-[var(--text-on-dark)]"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22D3EE] shrink-0" aria-hidden="true" />
                <span>No sign-up needed</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3B82F6] shrink-0" aria-hidden="true" />
                <span>Free resources</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B5CF6] shrink-0" aria-hidden="true" />
                <span>Student-led</span>
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive 3D Hardware + Build Cluster (with responsive/reduced-motion image fallback) */}
          <div className="lg:col-span-6">
            <div
              ref={sceneContainerRef}
              data-cursor={showInteractive3D ? '3d' : undefined}
              className="relative w-full h-[300px] sm:h-[360px] lg:h-[460px] rounded-2xl border border-white/12 bg-gradient-to-br from-[#0F172A]/85 via-[#070B1A]/90 to-[#111827]/85 overflow-hidden shadow-2xl"
            >
              {/* Soft inner radial accent behind 3D subject */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 45%, rgba(59,130,246,0.18), rgba(139,92,246,0.12) 45%, transparent 72%)',
                }}
              />

              {showInteractive3D ? (
                <Suspense
                  fallback={
                    <img
                      src={HERO_FALLBACK_IMAGE}
                      alt="Engineering students collaborating with laptops, microcontroller boards, robotics, and cloud diagrams"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  }
                >
                  <LazyScene3D
                    isVisible={isHeroVisible}
                    onContextFallback={() => setContextLost(true)}
                  />
                </Suspense>
              ) : (
                <img
                  src={HERO_FALLBACK_IMAGE}
                  alt="Engineering students collaborating with laptops, microcontroller boards, robotics, and cloud diagrams"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}

              {showInteractive3D && (
                <p className="pointer-events-none absolute bottom-3.5 right-4 text-xs font-medium text-[#CBD5E1]/90">
                  Drag to rotate · Interactive 3D cluster
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Animated Glass Stat Cards */}
        <div className="mt-12 pt-8 border-t border-white/10">
          {loading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
              aria-busy="true"
              aria-label="Loading platform statistics"
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-16 bg-white/10 rounded" />
                    <div className="h-10 w-10 bg-white/10 rounded-xl" />
                  </div>
                  <div className="h-4 w-32 bg-white/10 rounded mt-3.5" />
                  <div className="h-3.5 w-40 bg-white/5 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {mergedStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
