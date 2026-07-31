import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  KeyRound,
  Layers,
  Minus,
  Plus,
  QrCode,
  Radio,
  Route,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Logo, Reveal, SectionHeader, Counter, spotMove } from "./ui";
import { SERVICES, TOTAL_CIDRS } from "../lib/services";

/* ============================= STATS STRIP ============================= */

export function StatsStrip() {
  const stats = [
    { to: SERVICES.length, suffix: "", label: "сервисов в базе маршрутов" },
    { to: TOTAL_CIDRS, suffix: "+", label: "подсетей split-tunneling" },
    { to: 7, suffix: "", label: "UDP-портов на выбор" },
    { to: 10, suffix: " с", prefix: "<", label: "до готового конфига" },
  ];
  return (
    <section className="relative border-b border-line/60 bg-abyss/40 px-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line/60 lg:grid-cols-4 lg:divide-x">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="px-2 py-10 text-center lg:py-12">
            <Counter
              to={s.to}
              suffix={s.suffix}
              prefix={s.prefix ?? ""}
              className="grad-text font-display text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-none"
            />
            <p className="mt-3 text-[11.5px] uppercase tracking-[0.18em] text-faint">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================= FEATURES ============================= */

const FEATURES = [
  {
    icon: KeyRound,
    title: "Ключи — только у вас",
    desc: "Пара Curve25519 генерируется в браузере по стандарту WireGuard. Приватный ключ никогда не покидает устройство.",
    tone: "flare",
  },
  {
    icon: Route,
    title: "Точечный split-tunneling",
    desc: `${TOTAL_CIDRS}+ подсетей популярных сервисов: через туннель идёт только выбранное, остальное — напрямую и быстро.`,
    tone: "pulse",
  },
  {
    icon: Layers,
    title: "Стандартный WireGuard",
    desc: "Только чистый протокол, который гарантированно понимают серверы Cloudflare WARP: конфиг заведётся в любом клиенте — от WireGuard до AmneziaVPN.",
    tone: "pulse",
  },
  {
    icon: QrCode,
    title: "QR для мобильных",
    desc: "Один кадр камеры — и конфигурация уже в WireGuard или AmneziaVPN на телефоне. Без кабелей и почты.",
    tone: "flare",
  },
  {
    icon: Radio,
    title: "Резервные эндпоинты",
    desc: "Автовыбор узла от API или ручной: 9 адресов сети Cloudflare и 7 UDP-портов на случай блокировок.",
    tone: "pulse",
  },
  {
    icon: Crown,
    title: "WARP+ из коробки",
    desc: "Вставьте лицензионный ключ — применим его при регистрации и получите приоритетный трафик WARP+.",
    tone: "flare",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-pulse/[0.05] blur-[130px]" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="02"
          kicker="Возможности"
          title={
            <>
              Сделано для <span className="grad-text-cool">скорости и тишины</span>
            </>
          }
          desc="Никаких аккаунтов, серверов-прокладок и сбора данных: генератор работает в вашем браузере и разговаривает только с Cloudflare."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div
                onMouseMove={spotMove}
                className="spotlight group glass relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-linebright/70"
              >
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
                    f.tone === "flare" ? "bg-flare/25" : "bg-pulse/25"
                  }`}
                />
                <div
                  className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border ${
                    f.tone === "flare"
                      ? "border-flare/30 bg-flare/10 text-flare"
                      : "border-pulse/30 bg-pulse/10 text-pulse"
                  }`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display relative mt-5 text-[15px] font-semibold text-snow">
                  {f.title}
                </h3>
                <p className="relative mt-2.5 text-[13px] leading-relaxed text-mist">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================= HOW IT WORKS ============================= */

const STEPS = [
  {
    num: "01",
    icon: KeyRound,
    title: "Локальные ключи",
    desc: "Браузер создаёт пару Curve25519: приватная часть остаётся у вас, публичная уходит на регистрацию.",
    accent: "text-flare",
  },
  {
    num: "02",
    icon: Radio,
    title: "Регистрация в сети",
    desc: "Публичный ключ регистрируется через официальный API Cloudflare — вы становитесь узлом WARP без аккаунта.",
    accent: "text-pulse",
  },
  {
    num: "03",
    icon: Smartphone,
    title: "Готовый .conf",
    desc: "Собираем файл под WireGuard или AmneziaWG: скачайте, импортируйте или отсканируйте QR-код телефоном.",
    accent: "text-mint",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="03"
          kicker="Как это работает"
          title={
            <>
              Три шага до <span className="grad-text">свободы</span>
            </>
          }
        />
        <div className="relative mt-14 grid gap-4 lg:grid-cols-3">
          <svg
            viewBox="0 0 1000 30"
            fill="none"
            preserveAspectRatio="none"
            className="absolute left-[8%] top-12 hidden h-8 w-[84%] lg:block"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="how-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ff7d1f" stopOpacity="0.7" />
                <stop offset="0.5" stopColor="#3fe3ff" stopOpacity="0.7" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 15 C 150 0, 250 30, 380 15 S 620 0, 720 15 S 900 28, 1000 13"
              stroke="url(#how-line)"
              strokeWidth="1.5"
              strokeDasharray="7 7"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.12}>
              <div className="glass group relative h-full rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-linebright/70">
                <div className="flex items-center justify-between">
                  <span className="font-display text-stroke text-5xl font-extrabold">{s.num}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-linebright/50 bg-panel">
                    <s.icon className={`h-5 w-5 ${s.accent}`} />
                  </span>
                </div>
                <h3 className="font-display mt-6 text-lg font-semibold text-snow">{s.title}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-mist">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================= FAQ ============================= */

const QA = [
  {
    q: "Это официальный сервис Cloudflare?",
    a: "Нет. WVFWARP — независимый генератор, который использует публичный API регистрации устройств сети WARP. Мы не аффилированы с Cloudflare, Inc., а WARP, 1.1.1.1 и Cloudflare — товарные знаки их правообладателя.",
  },
  {
    q: "Чем полный туннель отличается от режима сервисов?",
    a: "Полный туннель (AllowedIPs 0.0.0.0/0) отправляет через WARP весь трафик устройства. Режим сервисов прописывает через туннель только подсети выбранных приложений — всё остальное работает напрямую на полной скорости вашего провайдера.",
  },
  {
    q: "Почему нет режима AmneziaWG?",
    a: "Серверы Cloudflare WARP работают на стандартном WireGuard и не понимают обфускацию AmneziaWG (Jc, Jmin, H1–H4 и другие параметры): рукопожатие игнорируется, и клиент вечно висит на «подключении». Поэтому WVFWARP генерирует только чистые WireGuard-конфиги. Тот же эффект против блокировок даёт смена UDP-порта (500, 1701, 4500) или endpoint — без сломанного соединения.",
  },
  {
    q: "Безопасно ли это?",
    a: "Да: приватный ключ генерируется криптографически стойким генератором вашего браузера и никуда не отправляется. Мы не храним ни ключи, ни конфиги, ни логи — всё живёт в памяти вкладки и исчезает при закрытии.",
  },
  {
    q: "Конфиг не подключается. Что делать?",
    a: "Попробуйте сменить UDP-порт (провайдеры чаще всего режут 2408 — попробуйте 500, 1701 или 4500), выберите другой endpoint, снизьте MTU до 1280 и включите PersistentKeepalive 25. Если сеть блокирует WireGuard по сигнатурам — включите маскировку AmneziaWG.",
  },
  {
    q: "Куда вводить ключ WARP+?",
    a: "В поле «Ключ WARP+» в шаге «Аккаунт». Ключ можно найти в приложении 1.1.1.1: Account → Key. Мы применим лицензию сразу при регистрации устройства — конфиг получит приоритетный трафик WARP+.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/4 h-[380px] w-[380px] rounded-full bg-flare/[0.05] blur-[120px]" />
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          index="04"
          kicker="FAQ"
          align="center"
          title={
            <>
              Вопросы <span className="grad-text-cool">и ответы</span>
            </>
          }
        />
        <div className="mt-12 space-y-3">
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`glass w-full rounded-2xl p-5 text-left transition-all duration-300 sm:p-6 ${
                    isOpen ? "border-linebright/70" : "hover:border-linebright/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-4">
                      <span className="font-mono text-[11px] text-flare">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[15px] font-bold transition-colors ${
                          isOpen ? "text-snow" : "text-mist"
                        }`}
                      >
                        {item.q}
                      </span>
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 border-flare/50 bg-flare/15 text-flare"
                          : "border-linebright/50 text-mist"
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pl-9 pr-4 pt-4 text-[13.5px] leading-relaxed text-mist">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================= FOOTER ============================= */

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line/60 px-5 pt-20 sm:px-8">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[900px] -translate-x-1/2 rounded-full bg-pulse/[0.05] blur-[120px]" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Logo size={44} />
            <div>
              <p className="font-display text-base font-bold tracking-[0.18em] text-snow">
                WVF<span className="grad-text">WARP</span>
              </p>
              <p className="mt-1 text-xs text-faint">
                Конфигурации WARP за секунды — прямо в браузере
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-2">
            {[
              ["#generator", "Генератор"],
              ["#features", "Возможности"],
              ["#how", "Как это работает"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[13px] font-medium text-mist transition-colors hover:text-snow"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-xs text-faint">
            <ShieldCheck className="h-4 w-4 text-mint" />
            Ключи не покидают ваш браузер
          </div>
        </div>

        <div className="mt-12 select-none overflow-hidden">
          <p className="font-display text-stroke whitespace-nowrap text-center text-[clamp(4rem,14vw,12rem)] font-extrabold leading-none tracking-tight opacity-40">
            WVFWARP
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line/60 py-7 text-[11px] text-faint sm:flex-row">
          <p>
            Независимый проект. Не аффилирован с Cloudflare, Inc. WARP, 1.1.1.1 и Cloudflare —
            товарные знаки соответствующих правообладателей.
          </p>
          <p className="font-mono tracking-wider">build {new Date().getFullYear()} · v2.0</p>
        </div>
      </div>
    </footer>
  );
}
