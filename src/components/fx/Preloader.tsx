import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "../ui";

const WORDS = [
  "инициализация туннеля",
  "сборка entropy pool",
  "curve25519 · handshake",
  "разгон до warp-скорости",
];

export default function Preloader() {
  const [n, setN] = useState(0);
  const [wi, setWi] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1750;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(e * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const iv = setInterval(() => setWi((v) => (v + 1) % WORDS.length), 470);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-void"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.85, ease: [0.83, 0, 0.17, 1] }}
    >
      {/* стрелы гиперпространства */}
      <span className="streak left-0 top-[18%]" />
      <span className="streak streak-flare left-0 top-[34%]" style={{ animationDelay: "0.35s" }} />
      <span className="streak left-0 top-[62%]" style={{ animationDelay: "0.7s" }} />
      <span className="streak streak-flare left-0 top-[80%]" style={{ animationDelay: "0.15s" }} />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <motion.div
          className="absolute -inset-7 rounded-full border border-pulse/25"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.12, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -inset-14 rounded-full border border-flare/15"
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.35, 0.08, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Logo size={62} />
      </motion.div>

      <div className="mt-8 h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={wi}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="font-mono text-[11px] uppercase tracking-[0.32em] text-mist"
          >
            {WORDS[wi]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-6 h-px w-56 overflow-hidden bg-panel2">
        <div
          className="h-full origin-left bg-gradient-to-r from-flare to-pulse transition-transform duration-100"
          style={{ transform: `scaleX(${n / 100})` }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="font-display text-stroke-thin pointer-events-none absolute bottom-2 right-6 select-none text-[clamp(4rem,14vw,9rem)] font-extrabold leading-none tabular-nums"
      >
        {String(n).padStart(3, "0")}
      </motion.span>
    </motion.div>
  );
}
