import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  Fingerprint,
  KeyRound,
  QrCode,
  Radio,
  ShieldCheck,
  Split,
} from "lucide-react";
import WarpTunnel from "./WarpTunnel";
import { Magnetic, easeOut } from "./ui";
import { SERVICES, TOTAL_CIDRS } from "../lib/services";

const float = (delay = 0) => ({
  initial: { opacity: 0, y: 40, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: easeOut, delay },
  },
});

const ROTATE_WORDS = ["трафиком", "маршрутами", "приватностью", "скоростью"];

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI((v) => (v + 1) % ROTATE_WORDS.length), 2300);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATE_WORDS[i]}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="grad-text inline-block font-bold"
        >
          {ROTATE_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* туннель */}
      <WarpTunnel className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,transparent_35%,#04060c_88%)]" />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" />

      {/* плавающие чипы */}
      <motion.div
        {...float(0.9)}
        className="glass absolute left-[6%] top-[26%] hidden items-center gap-2.5 rounded-2xl px-4 py-3 lg:flex animate-float"
      >
        <KeyRound className="h-4 w-4 text-flare" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">Curve25519</p>
          <p className="text-xs font-semibold text-snow">ключи — локально</p>
        </div>
      </motion.div>
      <motion.div
        {...float(1.05)}
        className="glass absolute right-[7%] top-[30%] hidden items-center gap-2.5 rounded-2xl px-4 py-3 lg:flex animate-float2"
      >
        <Radio className="h-4 w-4 text-pulse" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">endpoint</p>
          <p className="text-xs font-semibold text-snow">engage:2408 → 8886</p>
        </div>
      </motion.div>
      <motion.div
        {...float(1.2)}
        className="glass absolute bottom-[30%] left-[10%] hidden items-center gap-2.5 rounded-2xl px-4 py-3 xl:flex animate-float2"
      >
        <Split className="h-4 w-4 text-mint" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">split-tunnel</p>
          <p className="text-xs font-semibold text-snow">{TOTAL_CIDRS}+ сетей сервисов</p>
        </div>
      </motion.div>
      <motion.div
        {...float(1.35)}
        className="glass absolute bottom-[26%] right-[9%] hidden items-center gap-2.5 rounded-2xl px-4 py-3 xl:flex animate-float"
      >
        <QrCode className="h-4 w-4 text-flare2" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">экспорт</p>
          <p className="text-xs font-semibold text-snow">.conf и QR-код</p>
        </div>
      </motion.div>

      {/* центр */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 pt-32 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.15 }}
          className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-mist">
            Генератор Cloudflare WARP · v2
          </span>
        </motion.div>

        <h1 className="mt-8 select-none">
          <motion.span
            initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: easeOut, delay: 0.28 }}
            className="font-display text-stroke block text-[clamp(3.4rem,12vw,9.5rem)] font-extrabold leading-[0.92] tracking-tight"
          >
            WVF
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: easeOut, delay: 0.42 }}
            className="grad-text font-display block text-[clamp(3.4rem,12vw,9.5rem)] font-extrabold leading-[0.95] tracking-tight drop-shadow-[0_0_45px_rgba(255,125,31,0.25)]"
          >
            WARP·GEN
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.58 }}
          className="mt-7 text-[15px] font-semibold text-snow sm:text-lg"
        >
          Тотальный контроль над <RotatingWord />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.68 }}
          className="mt-3 max-w-xl text-balance text-[15px] leading-relaxed text-mist sm:text-base"
        >
          Готовые WireGuard-конфигурации Cloudflare WARP за десять секунд.
          Приватный ключ рождается и остаётся в вашем браузере — а трафик
          вы направляете только туда, куда нужно.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <a
              href="#generator"
              className="glow-flare group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-flare to-[#ff9d45] px-8 py-4 text-sm font-bold text-void transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,125,31,0.5)] active:scale-[0.98]"
            >
              Сгенерировать конфигурацию
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </Magnetic>
          <Magnetic strength={0.2}>
            <a
              href="#how"
              className="glass inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold text-snow transition-colors hover:border-linebright"
            >
              <ShieldCheck className="h-4 w-4 text-pulse" />
              Как это работает
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.05 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {[
            { icon: Fingerprint, text: "без аккаунтов и логов" },
            { icon: KeyRound, text: "ключи не покидают браузер" },
            { icon: Split, text: `${SERVICES.length} сервисов для раздельного туннеля` },
          ].map((s, idx) => (
            <motion.span
              key={s.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + idx * 0.12, duration: 0.6, ease: easeOut }}
              className="flex items-center gap-2 text-xs text-faint"
            >
              <s.icon className="h-3.5 w-3.5 text-flare/80" />
              {s.text}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* бегущая строка */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="relative z-10 border-t border-line/60 bg-void/40 py-4 backdrop-blur-sm"
      >
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
            {[...SERVICES, ...SERVICES].map((s, i) => (
              <span
                key={s.id + i}
                className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-faint"
              >
                <span className="h-1 w-1 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
