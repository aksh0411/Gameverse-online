"use client";

/**
 * Nexus 3D Animated Login
 * ------------------------------------------------------------------
 * Split-screen authentication UI: an interactive CSS 3D showcase of
 * floating technology logos on the left, a glassmorphism login card
 * on the right.
 *
 * Stack: React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
 * Theming: shadcn CSS variables (works in light and dark automatically).
 *
 * This is a frontend demo and does not authenticate users by itself.
 * Connect a real authentication provider through the optional callbacks.
 *
 * Requirements:
 * - React 18+
 * - TypeScript
 * - Tailwind CSS with the shadcn/ui semantic color tokens used below
 * - framer-motion
 * - lucide-react
 *
 * No project-specific "@/lib/utils" alias is required.
 * accentColor must be a 6-digit hex value, e.g. "#8B5CF6".
 *
 * Accessibility:
 * - Form controls have visible labels and validation descriptions.
 * - Status updates are announced to assistive technology.
 * - Decorative 3D artwork is hidden from the accessibility tree.
 * - Motion is disabled when the user requests reduced motion.
 */

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type FormEvent,
  type InputHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
/**
 * Joins conditional class names without requiring a project-specific alias.
 * Supports strings, false/null/undefined values, and simple class maps.
 */
type ClassValue = string | false | null | undefined | Record<string, boolean>;

function cn(...values: ClassValue[]): string {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      return Object.entries(value)
        .filter(([, enabled]) => enabled)
        .map(([className]) => className);
    })
    .join(" ");
}


/* ==================================================================
   1. TYPES
   ================================================================== */

export interface NexusLoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface NexusLoginProps {
  brandName?: string;
  logo?: ReactNode;
  title?: string;
  description?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  signInText?: string;
  googleButtonText?: string;
  githubButtonText?: string;
  rememberMeText?: string;
  signupText?: string;
  signupLinkText?: string;
  forgotPasswordText?: string;
  dividerText?: string;
  /** Left panel copy */
  eyebrow?: string;
  headline?: string;
  tagline?: string;
  showSocialLogin?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  show3DScene?: boolean;
  enableAnimations?: boolean;
  enableMouseParallax?: boolean;
  /** 6-digit hex color used for glows and highlights */
  accentColor?: string;
  className?: string;
  onSubmit?: (credentials: NexusLoginCredentials) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onGithubLogin?: () => void | Promise<void>;
  onForgotPassword?: (email: string) => void | Promise<void>;
  onSignup?: () => void;
}

type StatusKind = "success" | "error" | "info";
type BusyKey = "email" | "google" | "github" | "forgot" | null;

interface StatusMessage {
  kind: StatusKind;
  text: string;
}


/* ==================================================================
   2. CONSTANTS AND SMALL HELPERS
   ================================================================== */

const DEFAULT_ACCENT = "#8B5CF6";
const BLUE = "#3B82F6";
const CYAN = "#22D3EE";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

/** Returns a safe 6-digit hex, falling back to the default accent. */
function safeHex(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_ACCENT;
}

/** "#8B5CF6" -> "139,92,246" */
function hexToRgb(hex: string): string {
  const h = safeHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
}

/** Appends an alpha channel (0-1) to a hex color. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${safeHex(hex)}${a}`;
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return undefined;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Subscribes to a media query and cleans the listener up on unmount. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();

    // Modern browsers use addEventListener; older Safari versions use addListener.
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [query]);

  return matches;
}


/* ==================================================================
   3. INLINE SVG LOGOS
   ================================================================== */

const logoClass = "h-10 w-10 drop-shadow-sm";

function ReactLogo() {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className={logoClass} aria-hidden="true">
      <circle r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

function JavaScriptLogo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#F7DF1E" />
      <text x="22" y="21.5" textAnchor="end" fontSize="11" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="#111">
        JS
      </text>
    </svg>
  );
}

function TypeScriptLogo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#3178C6" />
      <text x="22" y="21.5" textAnchor="end" fontSize="11" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="#fff">
        TS
      </text>
    </svg>
  );
}

function NextLogo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <circle cx="12" cy="12" r="11.5" fill="#0A0A0A" stroke="#fff" strokeOpacity="0.28" />
      <path d="M8.6 7.6v8.8M8.6 7.6l7.2 9.2M15.4 7.6v5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TailwindLogo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <path
        fill="#38BDF8"
        d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
      />
    </svg>
  );
}

function Html5Logo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <path d="M3.2 2l1.6 18L12 22l7.2-2L20.8 2z" fill="#E44D26" />
      <path d="M12 20.3V3.7h7.3L17.8 18.9z" fill="#F16529" />
      <text x="12" y="15.4" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="#fff">
        5
      </text>
    </svg>
  );
}

function Css3Logo() {
  return (
    <svg viewBox="0 0 24 24" className={logoClass} aria-hidden="true">
      <path d="M3.2 2l1.6 18L12 22l7.2-2L20.8 2z" fill="#1572B6" />
      <path d="M12 20.3V3.7h7.3L17.8 18.9z" fill="#33A9DC" />
      <text x="12" y="15.4" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="#fff">
        3
      </text>
    </svg>
  );
}

function GithubMark({ className = logoClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className, "text-foreground")} fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.7-3.78H1.34v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.36 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.34a12 12 0 0 0 0 10.8l4.02-3.09z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.34 6.6l4.02 3.09A7.2 7.2 0 0 1 12 4.77z" />
    </svg>
  );
}

/** Default brand mark: a gradient hexagon with a stylised "N". */
function NexusMark({ className }: { className?: string }) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={DEFAULT_ACCENT} />
          <stop offset="55%" stopColor={BLUE} />
          <stop offset="100%" stopColor={CYAN} />
        </linearGradient>
      </defs>
      <path d="M16 1.5l12.5 7.25v14.5L16 30.5 3.5 23.25V8.75z" fill={`url(#${gradientId})`} />
      <path d="M11 22V10l10 12V10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/* ==================================================================
   4. PARTICLE FIELD (canvas)
   Drifting dots joined by faint lines. Reacts gently to the mouse.
   ================================================================== */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: number;
}

const ParticleField = memo(function ParticleField({
  animate,
  interactive,
  accent,
}: {
  animate: boolean;
  interactive: boolean;
  accent: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = [hexToRgb(accent), "59,130,246", "34,211,238"];
    const pointer = { x: -9999, y: -9999 };
    let fg = "148,163,184";
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let raf = 0;
    let running = false;
    let visible = true;

    // Reads the current theme foreground so dots stay visible in light and dark
    const readTheme = () => {
      const m = getComputedStyle(canvas).color.match(/[\d.]+/g);
      if (m && m.length >= 3) fg = `${m[0]},${m[1]},${m[2]}`;
    };

    const draw = () => {
      if (frame++ % 90 === 0) readTheme();
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (animate) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;

          // Soft push away from the pointer
          if (interactive) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 0 && d2 < 140 * 140) {
              const d = Math.sqrt(d2);
              const force = ((140 - d) / 140) * 0.7;
              p.x += (dx / d) * force;
              p.y += (dy / d) * force;
            }
          }
        }

        const color = p.c < 3 ? palette[p.c] : fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.c < 3 ? 0.75 : 0.35})`;
        ctx.fill();
      }

      // Connecting lines between close neighbours
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            const alpha = (1 - Math.sqrt(d2) / 110) * 0.16;
            ctx.strokeStyle = `rgba(${fg},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      const shouldRun = animate && visible && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(16, Math.min(interactive ? 70 : 42, Math.floor((w * h) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 0.8 + Math.random() * 1.6,
        c: Math.floor(Math.random() * 5),
      }));
      draw();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);

    const intersection =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
          })
        : null;
    intersection?.observe(host);

    document.addEventListener("visibilitychange", sync);
    if (interactive) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    readTheme();
    resize();
    sync();

    // Everything below is removed on unmount
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      intersection?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [animate, interactive, accent]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-foreground"
    />
  );
});


/* ==================================================================
   5. AMBIENT LAYER (dot grid, orbs, lines, floating shapes)
   ================================================================== */

const AmbientLayer = memo(function AmbientLayer({
  animate,
  accent,
  shiftX,
  shiftY,
  rich = true,
}: {
  animate: boolean;
  accent: string;
  shiftX?: MotionValue<number>;
  shiftY?: MotionValue<number>;
  rich?: boolean;
}) {
  const shapes = [
    { top: "12%", left: "10%", size: 26, kind: "square", dur: 14 },
    { top: "24%", left: "84%", size: 22, kind: "circle", dur: 18 },
    { top: "70%", left: "8%", size: 30, kind: "circle", dur: 20 },
    { top: "82%", left: "78%", size: 24, kind: "square", dur: 16 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot-grid texture, faded toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.16) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 100%)",
        }}
      />

      {/* Blurred ambient orbs (shift slightly with the mouse) */}
      <motion.div className="absolute inset-0" style={{ x: shiftX, y: shiftY }}>
        <div
          className="absolute -left-24 -top-24 h-[380px] w-[380px] rounded-full blur-[110px]"
          style={{ background: accent, opacity: 0.22 }}
        />
        <div
          className="absolute -bottom-28 -right-20 h-[340px] w-[340px] rounded-full blur-[110px]"
          style={{ background: BLUE, opacity: 0.18 }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-[240px] w-[240px] rounded-full blur-[100px]"
          style={{ background: CYAN, opacity: 0.12 }}
        />
      </motion.div>

      {rich && (
        <>
          {/* Animated light lines */}
          {[18, 52, 86].map((top, i) => (
            <motion.div
              key={top}
              className="absolute h-px w-1/2"
              style={{
                top: `${top}%`,
                background: `linear-gradient(90deg, transparent, ${withAlpha(i === 1 ? CYAN : accent, 0.7)}, transparent)`,
              }}
              initial={{ x: "-60%", opacity: 0 }}
              animate={animate ? { x: ["-60%", "220%"], opacity: [0, 0.8, 0] } : { opacity: 0 }}
              transition={{ duration: 9 + i * 2, delay: i * 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Floating geometric elements */}
          {shapes.map((s, i) => (
            <motion.span
              key={i}
              className={cn(
                "absolute border border-foreground/15 bg-foreground/[0.03]",
                s.kind === "circle" ? "rounded-full" : "rounded-md"
              )}
              style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
              animate={animate ? { y: [0, -16, 0], rotate: [0, 90, 180] } : undefined}
              transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}
    </div>
  );
});


/* ==================================================================
   6. 3D TECHNOLOGY SCENE
   Two counter-rotating orbits of logo cards around a glowing core.
   Cards counter-rotate so they always face the viewer.
   ================================================================== */

interface TechItem {
  id: string;
  label: string;
  glow: string;
  ring: 0 | 1;
  angle: number; // degrees around the orbit
  y: number; // vertical offset in px
  Logo: ComponentType;
}

const ORBITS = [
  { radius: 150, duration: 70, direction: 1 },
  { radius: 235, duration: 100, direction: -1 },
] as const;

const TECH: TechItem[] = [
  { id: "react", label: "React", glow: "#61DAFB", ring: 0, angle: 200, y: -60, Logo: ReactLogo },
  { id: "typescript", label: "TypeScript", glow: "#3178C6", ring: 0, angle: 290, y: 50, Logo: TypeScriptLogo },
  { id: "tailwind", label: "Tailwind CSS", glow: "#38BDF8", ring: 0, angle: 20, y: -30, Logo: TailwindLogo },
  { id: "github", label: "GitHub", glow: "#8B8B9A", ring: 0, angle: 110, y: 70, Logo: GithubMark },
  { id: "javascript", label: "JavaScript", glow: "#F7DF1E", ring: 1, angle: 245, y: 70, Logo: JavaScriptLogo },
  { id: "nextjs", label: "Next.js", glow: "#9CA3AF", ring: 1, angle: 335, y: -70, Logo: NextLogo },
  { id: "html5", label: "HTML5", glow: "#E44D26", ring: 1, angle: 65, y: 20, Logo: Html5Logo },
  { id: "css3", label: "CSS3", glow: "#1572B6", ring: 1, angle: 155, y: -35, Logo: Css3Logo },
];

const TechScene = memo(function TechScene({
  animate,
  rotateX,
  rotateY,
  accent,
  logo,
}: {
  animate: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  accent: string;
  logo: ReactNode;
}) {
  return (
    <div aria-hidden className="relative h-[560px] w-[560px]" style={{ perspective: 1100 }}>
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={animate ? { opacity: 0, scale: 0.88 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glowing platform under the scene */}
        <div
          className="absolute left-1/2 top-1/2 h-[460px] w-[460px] rounded-full"
          style={{
            transform: "translate(-50%, -50%) translateY(210px) rotateX(90deg)",
            background: `radial-gradient(circle, ${withAlpha(accent, 0.35)}, transparent 65%)`,
          }}
        />

        {/* Orbital rings, each with a travelling light arc */}
        {ORBITS.map((orbit, i) => (
          <div
            key={orbit.radius}
            className="absolute left-1/2 top-1/2 rounded-full border border-foreground/10"
            style={{
              width: orbit.radius * 2,
              height: orbit.radius * 2,
              transform: "translate(-50%, -50%) rotateX(90deg)",
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid transparent",
                borderTopColor: i === 0 ? accent : CYAN,
                borderRightColor: withAlpha(i === 0 ? accent : CYAN, 0.25),
                filter: `drop-shadow(0 0 6px ${i === 0 ? accent : CYAN})`,
              }}
              animate={animate ? { rotate: orbit.direction * 360 } : undefined}
              transition={{ duration: 18 + i * 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ))}

        {/* Tilted dashed accent ring */}
        <div
          className="absolute left-1/2 top-1/2 h-[330px] w-[330px] rounded-full border border-dashed border-foreground/15"
          style={{ transform: "translate(-50%, -50%) rotateX(68deg) rotateY(24deg)" }}
        />

        {/* Core */}
        <div className="absolute left-1/2 top-1/2 -ml-14 -mt-14 h-28 w-28">
          <motion.div
            className="relative h-full w-full"
            animate={animate ? { y: [0, -10, 0] } : undefined}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -inset-6 rounded-full blur-2xl" style={{ background: accent, opacity: 0.4 }} />
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                background: `linear-gradient(135deg, ${accent}, ${BLUE}, ${CYAN})`,
              }}
            />
            <div
              className="absolute inset-[2px] flex items-center justify-center bg-card"
              style={{ clipPath: "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center">{logo}</div>
            </div>
          </motion.div>
        </div>

        {/* Orbiting logo cards */}
        {ORBITS.map((orbit, ringIndex) => (
          <motion.div
            key={orbit.radius}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={animate ? { rotateY: orbit.direction * 360 } : undefined}
            transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
          >
            {TECH.filter((t) => t.ring === ringIndex).map((tech, i) => {
              const rad = (tech.angle * Math.PI) / 180;
              const x = Math.cos(rad) * orbit.radius;
              const z = Math.sin(rad) * orbit.radius;

              return (
                <div
                  key={tech.id}
                  className="absolute left-1/2 top-1/2 -ml-[38px] -mt-[38px]"
                  style={{
                    transform: `translate3d(${x}px, ${tech.y}px, ${z}px)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Counter-rotation keeps the card facing the viewer */}
                  <motion.div
                    style={{ transformStyle: "preserve-3d" }}
                    animate={animate ? { rotateY: -orbit.direction * 360 } : undefined}
                    transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
                  >
                    {/* Independent floating motion */}
                    <motion.div
                      animate={animate ? { y: [0, -9, 0], rotateZ: [-2, 2, -2] } : undefined}
                      transition={{
                        duration: 4.5 + ((i + ringIndex * 2) % 4) * 0.8,
                        delay: i * 0.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Hover depth change + entrance */}
                      <motion.div
                        initial={animate ? { opacity: 0, scale: 0.4 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={animate ? { scale: 1.16, z: 60 } : undefined}
                        transition={{
                          type: "spring",
                          stiffness: 240,
                          damping: 18,
                          delay: animate ? 0.3 + (i + ringIndex * 4) * 0.08 : 0,
                        }}
                        className="group pointer-events-auto relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-border bg-card/75 backdrop-blur-md"
                        style={{
                          boxShadow: `0 0 34px -8px ${withAlpha(tech.glow, 0.55)}, 0 18px 36px -14px rgba(0,0,0,0.5)`,
                        }}
                      >
                        <span className="sr-only">{tech.label}</span>
                        <tech.Logo />
                        <span aria-hidden="true" className="pointer-events-none absolute -bottom-7 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[11px] font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {tech.label}
                        </span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});


/* ==================================================================
   7. SHOWCASE PANEL (left side)
   ================================================================== */

function ShowcasePanel({
  animate,
  parallax,
  accent,
  logo,
  eyebrow,
  headline,
  tagline,
}: {
  animate: boolean;
  parallax: boolean;
  accent: string;
  logo: ReactNode;
  eyebrow: string;
  headline: string;
  tagline: string;
}) {
  // Pointer position, -0.5 to 0.5 across the panel
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 90, damping: 18, mass: 0.8 };

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), spring);
  // Resting tilt is -16deg so the orbit rings read as ellipses
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [-26, -6]), spring);
  const orbShiftX = useSpring(useTransform(mx, [-0.5, 0.5], [28, -28]), spring);
  const orbShiftY = useSpring(useTransform(my, [-0.5, 0.5], [20, -20]), spring);

  const handleMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!parallax || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // "Build. Create. Authenticate." -> three lines, last one in accent gradient
  const lines = headline.split(/(?<=\.)\s+/);

  return (
    <aside
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative flex flex-col items-center justify-center overflow-hidden border-b border-border bg-muted/40 px-6 py-6 lg:border-b-0 lg:border-r lg:py-12"
    >
      <AmbientLayer animate={animate} accent={accent} shiftX={orbShiftX} shiftY={orbShiftY} />
      <ParticleField animate={animate} interactive={parallax} accent={accent} />

      {/* Scene is scaled down per breakpoint inside a fixed-size frame */}
      <div className="relative z-10 h-[200px] w-full sm:h-[250px] md:h-[300px] lg:h-[430px] xl:h-[510px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.42] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.9]">
          <TechScene animate={animate} rotateX={rotateX} rotateY={rotateY} accent={accent} logo={logo} />
        </div>
      </div>

      {/* Copy (hidden on small phones so the form stays the focus) */}
      <motion.div
        className="relative z-10 mt-2 hidden max-w-md text-center md:block lg:mt-4"
        initial={animate ? { opacity: 0, y: 24 } : false}
        animate={animate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ duration: animate ? 0.8 : 0, delay: animate ? 0.25 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-muted-foreground backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span
              className={cn("absolute inline-flex h-full w-full rounded-full opacity-70", animate && "animate-ping motion-reduce:animate-none")}
              style={{ background: CYAN }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: CYAN }} />
          </span>
          {eyebrow}
        </p>

        <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight text-foreground lg:text-4xl xl:text-5xl">
          {lines.map((line, i) => {
            const last = i === lines.length - 1;
            return (
              <span key={i} className="block">
                {last ? (
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${BLUE}, ${CYAN})` }}
                  >
                    {line}
                  </span>
                ) : (
                  line
                )}
              </span>
            );
          })}
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tagline}
        </p>
      </motion.div>
    </aside>
  );
}


/* ==================================================================
   8. FORM PIECES
   ================================================================== */

function Field({
  id,
  label,
  error,
  icon,
  trailing,
  inputRef,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
  icon: ReactNode;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div
        className={cn(
          "group relative flex items-center rounded-xl border bg-background/60 backdrop-blur-md transition-all duration-200",
          error
            ? "border-destructive focus-within:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]"
            : "border-border hover:border-foreground/30 focus-within:border-[var(--nx-accent)] focus-within:shadow-[0_0_0_4px_var(--nx-accent-soft)]"
        )}
      >
        <span className="pointer-events-none absolute left-3.5 text-muted-foreground transition-colors group-focus-within:text-[var(--nx-accent)]">
          {icon}
        </span>
        <input
          id={id}
          ref={inputRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full min-w-0 rounded-xl bg-transparent pl-11 pr-12 text-base text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
          {...inputProps}
        />
        {trailing && <span className="absolute right-1.5 flex items-center">{trailing}</span>}
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 overflow-hidden text-xs text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  loading,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden /> : icon}
      {label}
    </motion.button>
  );
}

function RememberMe({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="flex h-5 w-5 items-center justify-center rounded-md border border-border bg-background/60 text-white transition-all peer-checked:border-transparent peer-checked:bg-[var(--nx-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background group-hover:border-foreground/40"
      >
        <svg viewBox="0 0 16 16" className={cn("h-3 w-3 transition-opacity", checked ? "opacity-100" : "opacity-0")}>
          <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="select-none transition-colors group-hover:text-foreground">{label}</span>
    </label>
  );
}

function StatusBanner({ status }: { status: StatusMessage | null }) {
  const styles: Record<StatusKind, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-[var(--nx-accent)]/30 bg-[var(--nx-accent-soft)] text-foreground",
  };
  const Icon = status?.kind === "success" ? CheckCircle2 : status?.kind === "error" ? AlertCircle : Info;

  return (
    <div aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false} mode="wait">
        {status && (
          <motion.div
            key={`${status.kind}-${status.text}`}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div role={status.kind === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm", styles[status.kind])}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{status.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ==================================================================
   9. MAIN COMPONENT
   ================================================================== */

export function NexusLogin({
  brandName = "Nexus",
  logo,
  title = "Welcome back",
  description = "Sign in to continue to your workspace.",
  emailPlaceholder = "you@example.com",
  passwordPlaceholder = "Enter your password",
  signInText = "Sign in",
  googleButtonText = "Continue with Google",
  githubButtonText = "Continue with GitHub",
  rememberMeText = "Remember me",
  signupText = "Don't have an account?",
  signupLinkText = "Create account",
  forgotPasswordText = "Forgot password?",
  dividerText = "OR CONTINUE WITH EMAIL",
  eyebrow = "THE FUTURE STARTS HERE",
  headline = "Build. Create. Authenticate.",
  tagline = "Your next great idea begins with a better workspace.",
  showSocialLogin = true,
  showRememberMe = true,
  showForgotPassword = true,
  show3DScene = true,
  enableAnimations = true,
  enableMouseParallax = true,
  accentColor = DEFAULT_ACCENT,
  className,
  onSubmit,
  onGoogleLogin,
  onGithubLogin,
  onForgotPassword,
  onSignup,
}: NexusLoginProps) {
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  const accent = safeHex(accentColor);
  const animate = enableAnimations && !reducedMotion;
  const parallax = animate && enableMouseParallax && finePointer;
  const brandMark = logo ?? <NexusMark className="h-full w-full" />;

  // Form state
  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const rememberId = `${uid}-remember`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [busy, setBusy] = useState<BusyKey>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);

  // Guards async work that finishes after the component unmounts
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    },
    [touched.email]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    },
    [touched.password]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });
    setStatus(null);

    if (emailError) return emailRef.current?.focus();
    if (passwordError) return passwordRef.current?.focus();

    setBusy("email");
    try {
      if (onSubmit) await onSubmit({ email: email.trim(), password, remember });
      else await wait(1400);
      if (!alive.current) return;
      setStatus({
        kind: "success",
        text: onSubmit
          ? "Credentials submitted."
          : `Demo sign-in finished for ${email.trim()}. No real authentication took place.`,
      });
    } catch (err) {
      if (!alive.current) return;
      setStatus({
        kind: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      if (alive.current) setBusy(null);
    }
  };

  const runSocial = async (key: "google" | "github", name: string, callback?: () => void | Promise<void>) => {
    if (busy) return;
    setBusy(key);
    setStatus(null);
    try {
      if (callback) await callback();
      else await wait(1000);
      if (!alive.current) return;
      setStatus({
        kind: "info",
        text: callback
          ? `Continuing with ${name}.`
          : `${name} sign-in demo triggered. No account was accessed.`,
      });
    } catch (err) {
      if (!alive.current) return;
      setStatus({
        kind: "error",
        text: err instanceof Error ? err.message : `${name} sign-in failed. Please try again.`,
      });
    } finally {
      if (alive.current) setBusy(null);
    }
  };

  const handleForgot = async () => {
    if (busy) return;
    const emailError = validateEmail(email);
    if (emailError) {
      setTouched((prev) => ({ ...prev, email: true }));
      setErrors((prev) => ({ ...prev, email: emailError }));
      setStatus({ kind: "info", text: "Enter your email above first, then try again." });
      emailRef.current?.focus();
      return;
    }

    setBusy("forgot");
    setStatus(null);
    try {
      if (onForgotPassword) await onForgotPassword(email.trim());
      else await wait(900);
      if (!alive.current) return;
      setStatus({
        kind: "info",
        text: onForgotPassword
          ? `Password reset requested for ${email.trim()}.`
          : `Demo: a reset link would be sent to ${email.trim()}. No email was sent.`,
      });
    } catch (err) {
      if (!alive.current) return;
      setStatus({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not start the password reset.",
      });
    } finally {
      if (alive.current) setBusy(null);
    }
  };

  const handleSignup = () => {
    try {
      onSignup?.();
      setStatus({
        kind: "info",
        text: onSignup
          ? "Sign-up action started."
          : "Demo: the sign-up flow would open here.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        text: error instanceof Error
          ? error.message
          : "Could not open the sign-up flow. Please try again.",
      });
    }
  };

  // CSS variables used by focus rings and links
  const themeVars = {
    "--nx-accent": accent,
    "--nx-accent-soft": withAlpha(accent, 0.18),
  } as CSSProperties;

  const loading = busy !== null;

  return (
    <div
      style={themeVars}
      className={cn(
        "relative grid min-h-screen w-full overflow-x-hidden bg-background text-foreground",
        show3DScene ? "lg:grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {show3DScene && (
        <ShowcasePanel
          animate={animate}
          parallax={parallax}
          accent={accent}
          logo={brandMark}
          eyebrow={eyebrow}
          headline={headline}
          tagline={tagline}
        />
      )}

      {/* Authentication side */}
      <main className="relative flex items-center justify-center overflow-hidden px-4 py-10 sm:px-8 lg:py-16">
        {!show3DScene && <AmbientLayer animate={animate} accent={accent} />}
        {show3DScene && <AmbientLayer animate={animate} accent={accent} rich={false} />}

        <motion.div
          initial={animate ? { opacity: 0, y: 28 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animate ? 0.8 : 0, delay: animate ? 0.1 : 0, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Soft glow behind the card */}
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[2.5rem] opacity-40 blur-3xl"
            style={{ background: `linear-gradient(135deg, ${accent}, ${BLUE}, ${CYAN})` }}
          />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 text-card-foreground shadow-2xl backdrop-blur-xl sm:p-8">
            {/* Top accent hairline */}
            <div
              aria-hidden
              className="absolute inset-x-8 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, ${CYAN}, transparent)` }}
            />

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0">{brandMark}</div>
              <span className="text-lg font-semibold tracking-[0.18em]">{brandName.toUpperCase()}</span>
            </div>

            <h1 className="mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

            {/* Social login */}
            {showSocialLogin && (
              <>
                <div className="mt-7 grid grid-cols-1 gap-3">
                  <SocialButton
                    icon={<GoogleMark />}
                    label={googleButtonText}
                    loading={busy === "google"}
                    disabled={loading}
                    onClick={() => runSocial("google", "Google", onGoogleLogin)}
                  />
                  <SocialButton
                    icon={<GithubMark className="h-5 w-5" />}
                    label={githubButtonText}
                    loading={busy === "github"}
                    disabled={loading}
                    onClick={() => runSocial("github", "GitHub", onGithubLogin)}
                  />
                </div>

                <div className="my-6 flex items-center gap-4" role="separator" aria-label={dividerText}>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground">
                    {dividerText}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit} noValidate className={cn("space-y-5", !showSocialLogin && "mt-7")}>
              <Field
                id={emailId}
                label="Email address"
                type="email"
                required
                name="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={emailPlaceholder}
                value={email}
                error={touched.email ? errors.email : undefined}
                inputRef={emailRef}
                icon={<Mail className="h-[18px] w-[18px]" aria-hidden />}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, email: true }));
                  setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
                }}
              />

              <Field
                id={passwordId}
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                name="password"
                autoComplete="current-password"
                placeholder={passwordPlaceholder}
                value={password}
                error={touched.password ? errors.password : undefined}
                inputRef={passwordRef}
                icon={<Lock className="h-[18px] w-[18px]" aria-hidden />}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, password: true }));
                  setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
                }}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
                  </button>
                }
              />

              {(showRememberMe || showForgotPassword) && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  {showRememberMe ? (
                    <RememberMe id={rememberId} checked={remember} onChange={setRemember} label={rememberMeText} />
                  ) : (
                    <span />
                  )}
                  {showForgotPassword && (
                    <button
                      type="button"
                      onClick={handleForgot}
                      disabled={loading}
                      className="rounded-md py-1 text-sm font-medium text-[var(--nx-accent)] transition-opacity hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    >
                      {busy === "forgot" ? "Sending..." : forgotPasswordText}
                    </button>
                  )}
                </div>
              )}

              <StatusBanner status={status} />

              {/* Sign in */}
              <motion.button
                type="submit"
                disabled={loading}
                aria-busy={busy === "email"}
                whileHover={animate && !loading ? { y: -2 } : undefined}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="group relative isolate flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold text-white shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-80"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent}, ${BLUE})`,
                  boxShadow: `0 12px 30px -10px ${withAlpha(accent, 0.8)}`,
                }}
              >
                {/* Light sweep on hover */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[500%] motion-reduce:hidden"
                />
                {busy === "email" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
                    Signing in...
                  </>
                ) : (
                  <>
                    {signInText}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign-up prompt */}
            <p className="mt-7 text-center text-sm text-muted-foreground">
              {signupText}{" "}
              <button
                type="button"
                onClick={handleSignup}
                className="rounded-md font-semibold text-[var(--nx-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {signupLinkText}
              </button>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default NexusLogin;
