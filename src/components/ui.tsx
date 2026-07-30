import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: easeOut, delay: i * 0.08 },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  index,
  kicker,
  title,
  desc,
  align = "left",
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  desc?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <Reveal>
        <div
          className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
        >
          <span className="font-mono text-[11px] tracking-[0.3em] text-flare">
            {index}
          </span>
          <span className="h-px w-10 bg-gradient-to-r from-flare/70 to-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mist">
            {kicker}
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display mt-5 text-[clamp(1.7rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-tight text-snow">
          {title}
        </h2>
      </Reveal>
      {desc ? (
        <Reveal delay={0.16}>
          <p
            className={`mt-4 max-w-2xl text-[15px] leading-relaxed text-mist ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            {desc}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-xl border border-linebright/60 bg-panel2"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size * 0.62}
        height={size * 0.62}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lg-wvf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7d1f" />
            <stop offset="1" stopColor="#3fe3ff" />
          </linearGradient>
        </defs>
        <path
          d="M6 8.5l5 15L16 12l5 11.5 5-15"
          stroke="url(#lg-wvf)"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-pulse shadow-[0_0_8px_#3fe3ff]" />
    </span>
  );
}

export function GhostChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "flare" | "pulse" | "mint" | "rose";
}) {
  const tones: Record<string, string> = {
    default: "border-linebright/60 bg-panel/70 text-mist",
    flare: "border-flare/40 bg-flare/10 text-flare2",
    pulse: "border-pulse/40 bg-pulse/10 text-pulse2",
    mint: "border-mint/40 bg-mint/10 text-mint",
    rose: "border-rose/40 bg-rose/10 text-rose",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ======================= magnetic ======================= */

export function Magnetic({
  children,
  className = "",
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

/* ======================= divider marquee ======================= */

const Diamond = () => (
  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0" aria-hidden="true">
    <rect x="1.8" y="1.8" width="6.4" height="6.4" transform="rotate(45 5 5)" fill="#ff7d1f" opacity="0.7" />
  </svg>
);

export function DividerMarquee({
  words,
  reverse = false,
}: {
  words: string[];
  reverse?: boolean;
}) {
  const row = [...words, ...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-line/50 bg-abyss/50 py-6">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div
        className={`flex w-max items-center gap-10 ${
          reverse ? "animate-marquee-rev" : "animate-marquee"
        }`}
        style={{ animationDuration: "36s" }}
      >
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span
              className={`font-display whitespace-nowrap text-[clamp(1.6rem,4.5vw,3rem)] font-extrabold uppercase tracking-[0.14em] ${
                i % 3 === 1 ? "grad-text opacity-80" : "text-stroke-thin"
              }`}
            >
              {w}
            </span>
            <Diamond />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ======================= animated counter ======================= */

export function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* ======================= spotlight handler ======================= */

export const spotMove = (e: MouseEvent<HTMLDivElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--sx", `${e.clientX - r.left}px`);
  el.style.setProperty("--sy", `${e.clientY - r.top}px`);
};
