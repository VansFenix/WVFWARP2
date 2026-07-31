import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Clapperboard,
  Dices,
  Gamepad2,
  Ghost,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  Route,
  ShieldHalf,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { toast } from "./fx/toast";
import {
  DNS_PRESETS,
  DEFAULT_WORKER_PROXY,
  ENDPOINTS,
  MTU_OPTIONS,
  PORTS,
  buildConfig,
  downloadText,
  generateKeyPair,
  keyFingerprint,
  registerDevice,
  resolveEndpoint,
  randomConfigName,
  sanitizeName,
  sleep,
  type AmneziaOpts,
  type GenerateResult,
} from "../lib/warp";
import { SERVICES, SERVICE_GLYPHS, collectCidrs } from "../lib/services";
import ResultPanel, { type LogEntry } from "./ResultPanel";
import { Reveal, SectionHeader } from "./ui";

export type GenState = "idle" | "working" | "done";

const DEFAULT_AMNEZIA: AmneziaOpts = {
  enabled: false,
  jc: 4,
  jmin: 40,
  jmax: 70,
  s1: 0,
  s2: 0,
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
};

const randH = () => String(Math.floor(100_000_000 + Math.random() * 899_000_000));

const DEVICE_NAMES = [
  "falcon-9",
  "nebula-3",
  "orbit-x",
  "vostok-1",
  "pulsar-7",
  "comet-2",
  "zenit-4",
  "quasar-5",
];

const randomName = () =>
  DEVICE_NAMES[Math.floor(Math.random() * DEVICE_NAMES.length)];

interface Preset {
  id: string;
  name: string;
  desc: string;
  icon: "video" | "game" | "ghost";
  mode: "full" | "split";
  selected: string[];
  port: number;
  mtu: number;
  keepalive: number;
  dnsId: string;
  amnezia: AmneziaOpts;
}

const PRESETS: Preset[] = [
  {
    id: "media",
    name: "Стриминг и соцсети",
    desc: "YouTube, Twitch, Instagram и кино через туннель — остальное напрямую",
    icon: "video",
    mode: "split",
    selected: ["youtube", "instagram", "tiktok", "twitch", "netflix", "spotify"],
    port: 2408,
    mtu: 1280,
    keepalive: 25,
    dnsId: "standard",
    amnezia: { ...DEFAULT_AMNEZIA },
  },
  {
    id: "games",
    name: "Игры и голос",
    desc: "Discord-голос и игровые сервисы без потери пинга в остальном",
    icon: "game",
    mode: "split",
    selected: ["discord", "roblox", "twitch"],
    port: 2408,
    mtu: 1280,
    keepalive: 25,
    dnsId: "standard",
    amnezia: { ...DEFAULT_AMNEZIA },
  },
  {
    id: "stealth",
    name: "Максимальная тишина",
    desc: "Весь трафик + обфускация AmneziaWG на порту 4500 для жёстких DPI",
    icon: "ghost",
    mode: "full",
    selected: [],
    port: 4500,
    mtu: 1280,
    keepalive: 25,
    dnsId: "standard",
    amnezia: {
      enabled: true,
      jc: 4,
      jmin: 40,
      jmax: 70,
      s1: 0,
      s2: 0,
      h1: randH(),
      h2: randH(),
      h3: randH(),
      h4: randH(),
    },
  },
];

function StepCard({
  num,
  title,
  hint,
  children,
}: {
  num: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-flare">{num}</span>
          <h3 className="font-display text-[15px] font-semibold text-snow">{title}</h3>
        </div>
        {hint ? <span className="text-[11px] text-faint">{hint}</span> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-linebright/40 bg-void/60 px-4 py-3 text-sm text-snow placeholder:text-faint outline-none transition-colors focus:border-flare/60 focus:ring-2 focus:ring-flare/20";

export default function Generator() {
  const [mode, setMode] = useState<"full" | "split">("split");
  const [selected, setSelected] = useState<string[]>(["discord", "youtube", "instagram"]);
  const [endpoint, setEndpoint] = useState<string>("auto");
  const [port, setPort] = useState<number>(2408);
  const [mtu, setMtu] = useState<number>(1280);
  const [dnsId, setDnsId] = useState<string>("standard");
  const [keepalive, setKeepalive] = useState<number>(25);
  const [deviceName, setDeviceName] = useState("");
  const [warpKey, setWarpKey] = useState("");
  const [amnezia, setAmnezia] = useState<AmneziaOpts>(DEFAULT_AMNEZIA);
  const [customProxy, setCustomProxy] = useState(() => {
    try {
      return localStorage.getItem("wvf:proxy") || DEFAULT_WORKER_PROXY;
    } catch {
      return DEFAULT_WORKER_PROXY;
    }
  });

  const handleProxyChange = (val: string) => {
    setCustomProxy(val);
    try {
      localStorage.setItem("wvf:proxy", val);
    } catch { /* noop */ }
  };

  const [state, setState] = useState<GenState>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const activeCidrs = useMemo(() => collectCidrs(selected), [selected]);
  const canGenerate =
    state !== "working" && (mode === "full" || (mode === "split" && selected.length > 0));

  const pushLog = (msg: string, kind: LogEntry["kind"] = "info") =>
    setLogs((prev) => [
      ...prev,
      { ts: new Date().toLocaleTimeString("ru-RU", { hour12: false }), msg, kind },
    ]);

  const toggleService = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (p: Preset) => {
    setActivePreset(p.id);
    setMode(p.mode);
    setSelected(p.selected);
    setPort(p.port);
    setMtu(p.mtu);
    setKeepalive(p.keepalive);
    setDnsId(p.dnsId);
    setAmnezia(p.amnezia.enabled ? { ...p.amnezia, h1: randH(), h2: randH(), h3: randH(), h4: randH() } : p.amnezia);
    toast(`Пресет «${p.name}» применён`, "info");
  };

  const generate = async () => {
    if (!canGenerate) return;
    setState("working");
    setLogs([]);
    setResult(null);
    window.dispatchEvent(new CustomEvent("wvf-boost"));

    try {
      pushLog("Генерация пары ключей Curve25519…");
      const kp = generateKeyPair();
      await sleep(420);
      pushLog(`Ключи созданы · отпечаток ${keyFingerprint(kp.publicKey)}`, "ok");

      if (customProxy.trim()) {
        pushLog(`Прокси через Cloudflare Worker: ${customProxy.trim()}`, "info");
      }

      pushLog("Регистрация устройства в сети Cloudflare…");
      const outcome = await registerDevice(kp.publicKey, warpKey, pushLog, customProxy.trim() || undefined);

      pushLog("Сборка WireGuard-конфигурации…");
      await sleep(380);

      const reg = outcome.reg;
      const peer = reg.config.peers[0];
      const ep = resolveEndpoint(endpoint, port, peer.endpoint.host);
      const ips =
        mode === "full" ? ["0.0.0.0/0", "::/0"] : activeCidrs;
      const dns = [...(DNS_PRESETS.find((d) => d.id === dnsId)?.dns ?? [])];
      const cfgName = randomConfigName();
      const name = deviceName.trim() ? sanitizeName(deviceName) : cfgName;
      const accountLabel = outcome.offline
        ? "Автономный (offline)"
        : outcome.plusApplied
          ? "WARP+"
          : "Free";

      const config = buildConfig({
        privateKey: kp.privateKey,
        addressV4: reg.config.interface.addresses.v4,
        addressV6: reg.config.interface.addresses.v6,
        peerPublicKey: peer.public_key,
        endpoint: ep,
        allowedIps: ips,
        dns,
        mtu,
        keepalive,
        deviceName: name,
        accountLabel,
        amnezia,
        offline: outcome.offline,
      });

      setResult({
        config,
        fileName: `${cfgName}.conf`,
        qrText: config,
        endpoint: ep,
        allowedCount: ips.length,
        fingerprint: keyFingerprint(kp.publicKey),
        accountLabel,
        ipv4: reg.config.interface.addresses.v4,
        ipv6: reg.config.interface.addresses.v6,
        offline: outcome.offline,
      });

      pushLog(`Готово · endpoint ${ep}`, "ok");
      setState("done");
      toast(outcome.offline ? "Собран автономный конфиг" : "Конфигурация готова", outcome.offline ? "warn" : "ok");
    } catch (e) {
      pushLog(
        `Ошибка: ${e instanceof Error ? e.message : "неизвестная"}. Попробуйте ещё раз.`,
        "err",
      );
      setState("idle");
    }
  };

  return (
    <section id="generator" className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-flare/[0.05] blur-[130px]" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="01"
          kicker="Генератор"
          title={
            <>
              Соберите свой <span className="grad-text">туннель</span>
            </>
          }
          desc="Несколько переключателей — и готовый .conf уже в руках. Режим полного туннеля для всего трафика или точечная маршрутизация по сервисам."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          {/* левая колонка — настройки */}
          <div className="flex flex-col gap-5">
            <Reveal>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {PRESETS.map((p) => {
                  const Icon =
                    p.icon === "video" ? Clapperboard : p.icon === "game" ? Gamepad2 : Ghost;
                  const active = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                        active
                          ? "border-flare/50 bg-flare/[0.09] shadow-[0_0_28px_rgba(255,125,31,0.14)]"
                          : "glass hover:border-linebright/70 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            active
                              ? "border-flare/40 bg-flare/15 text-flare"
                              : "border-linebright/40 text-mist group-hover:text-flare2"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className={`text-[12.5px] font-bold ${active ? "text-snow" : "text-mist group-hover:text-snow"}`}>
                          {p.name}
                        </span>
                      </div>
                      <p className="mt-2 text-[10.5px] leading-snug text-faint">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal>
              <StepCard num="01" title="Режим маршрутизации">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModeButton
                    active={mode === "full"}
                    onClick={() => setMode("full")}
                    icon={<Globe className="h-5 w-5" />}
                    title="Полный туннель"
                    desc="Весь трафик устройства через WARP"
                  />
                  <ModeButton
                    active={mode === "split"}
                    onClick={() => setMode("split")}
                    icon={<Split2 />}
                    title="Только сервисы"
                    desc="Через WARP — выбранные приложения"
                  />
                </div>
              </StepCard>
            </Reveal>

            <motion.div
              initial={false}
              animate={{
                height: mode === "split" ? "auto" : 0,
                opacity: mode === "split" ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <StepCard
                num="02"
                title="Сервисы"
                hint={`${selected.length} из ${SERVICES.length} · ${activeCidrs.length} подсетей`}
              >
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {SERVICES.map((s) => {
                    const active = selected.includes(s.id);
                    const Glyph = SERVICE_GLYPHS[s.id];
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        aria-pressed={active}
                        className={`group relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center transition-all duration-300 ${
                          active
                            ? "border-transparent bg-white/[0.06]"
                            : "border-line/70 bg-transparent hover:border-linebright/60 hover:bg-white/[0.03]"
                        }`}
                        style={
                          active
                            ? { boxShadow: `inset 0 0 0 1.5px ${s.color}66, 0 0 22px ${s.color}22` }
                            : undefined
                        }
                      >
                        {active && (
                          <span
                            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                            style={{ background: s.color }}
                          >
                            <Check className="h-2.5 w-2.5 text-void" strokeWidth={3.5} />
                          </span>
                        )}
                        <span
                          className="transition-transform duration-300 group-hover:scale-110"
                          style={{ color: active ? s.color : "#8d9cbe" }}
                        >
                          {Glyph ? <Glyph className="h-6 w-6" /> : null}
                        </span>
                        <span
                          className={`text-[11px] font-semibold leading-tight ${
                            active ? "text-snow" : "text-mist"
                          }`}
                        >
                          {s.name}
                        </span>
                        <span className="text-[9.5px] leading-none text-faint">{s.tag}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelected(SERVICES.map((s) => s.id))}
                    className="rounded-full border border-linebright/50 px-3.5 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:border-pulse/60 hover:text-pulse2"
                  >
                    Выбрать все
                  </button>
                  <button
                    onClick={() => setSelected([])}
                    className="rounded-full border border-linebright/50 px-3.5 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:border-rose/60 hover:text-rose"
                  >
                    Очистить
                  </button>
                </div>
              </StepCard>
            </motion.div>

            <Reveal>
              <StepCard num="03" title="Соединение" hint="endpoint · порт · MTU · DNS">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-faint">
                      Endpoint
                    </span>
                    <select
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className={`${inputCls} appearance-none`}
                    >
                      {ENDPOINTS.map((e) => (
                        <option key={e.value} value={e.value} className="bg-panel">
                          {e.label} — {e.hint}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-faint">
                      Keepalive
                    </span>
                    <div className="flex gap-1.5">
                      {[0, 25, 60].map((k) => (
                        <Pill key={k} active={keepalive === k} onClick={() => setKeepalive(k)}>
                          {k === 0 ? "выкл" : `${k}с`}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-faint">
                    Порт UDP
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PORTS.map((p) => (
                      <Pill
                        key={p.value}
                        active={port === p.value}
                        onClick={() => setPort(p.value)}
                        title={p.hint}
                      >
                        {p.label}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-faint">
                      MTU
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {MTU_OPTIONS.map((m) => (
                        <Pill key={m} active={mtu === m} onClick={() => setMtu(m)}>
                          {m}
                        </Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-faint">
                      DNS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {DNS_PRESETS.map((d) => (
                        <Pill
                          key={d.id}
                          active={dnsId === d.id}
                          onClick={() => setDnsId(d.id)}
                          title={d.hint}
                        >
                          {d.label}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-pulse/15 bg-pulse/[0.04] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      <Globe className="h-3.5 w-3.5 text-pulse2" />
                      Прокси CF Worker
                    </label>
                    {customProxy && (
                      <button
                        onClick={() => handleProxyChange("")}
                        className="rounded-full border border-linebright/30 px-2.5 py-0.5 text-[10px] text-rose/70 transition-colors hover:border-rose/50 hover:text-rose"
                      >
                        очистить
                      </button>
                    )}
                  </div>
                  <div className="relative mt-2.5">
                    <input
                      value={customProxy}
                      onChange={(e) => handleProxyChange(e.target.value.trim())}
                      placeholder="https://wvf-proxy-xxx.workers.dev"
                      className={`${inputCls} pr-10 font-mono text-[12px] tracking-tight ${customProxy ? 'border-pulse/50' : ''}`}
                    />
                    {customProxy && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="h-4 w-4 text-mint" strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-faint/80">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-pulse2" />
                    По умолчанию запросы идут через Cloudflare Worker
                    (<code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">wvf-proxy</code>),
                    затем через встроенный прокси сайта
                    (<code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">/api</code>)
                    и публичные CORS-прокси.
                  </p>
                </div>
              </StepCard>
            </Reveal>

            <Reveal>
              <StepCard num="04" title="Маскировка" hint="против DPI">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModeButton
                    active={!amnezia.enabled}
                    onClick={() => setAmnezia({ ...amnezia, enabled: false })}
                    icon={<ShieldHalf className="h-5 w-5" />}
                    title="WireGuard"
                    desc="Стандартный протокол"
                  />
                  <ModeButton
                    active={amnezia.enabled}
                    onClick={() => setAmnezia({ ...amnezia, enabled: true })}
                    icon={<Layers className="h-5 w-5" />}
                    title="AmneziaWG"
                    desc="Обфускация заголовков"
                  />
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: amnezia.enabled ? "auto" : 0,
                    opacity: amnezia.enabled ? 1 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl border border-pulse/20 bg-pulse/[0.04] p-4">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {(
                        [
                          ["jc", "Jc"],
                          ["jmin", "Jmin"],
                          ["jmax", "Jmax"],
                          ["s1", "S1"],
                          ["s2", "S2"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="block">
                          <span className="mb-1 block font-mono text-[10px] text-pulse2">
                            {label}
                          </span>
                          <input
                            type="number"
                            value={amnezia[key]}
                            min={0}
                            max={65535}
                            onChange={(e) =>
                              setAmnezia({
                                ...amnezia,
                                [key]: Math.max(
                                  0,
                                  Math.min(65535, parseInt(e.target.value) || 0),
                                ),
                              })
                            }
                            className="w-full rounded-lg border border-linebright/40 bg-void/70 px-2.5 py-2 font-mono text-xs text-snow outline-none focus:border-pulse/60"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(["h1", "h2", "h3", "h4"] as const).map((key) => (
                        <label key={key} className="block">
                          <span className="mb-1 block font-mono text-[10px] uppercase text-pulse2">
                            {key.replace("h", "H")}
                          </span>
                          <input
                            value={amnezia[key]}
                            onChange={(e) =>
                              setAmnezia({
                                ...amnezia,
                                [key]: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                              })
                            }
                            className="w-full rounded-lg border border-linebright/40 bg-void/70 px-2.5 py-2 font-mono text-xs text-snow outline-none focus:border-pulse/60"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setAmnezia({ ...amnezia, h1: randH(), h2: randH(), h3: randH(), h4: randH() })
                      }
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-pulse/30 bg-pulse/10 px-3.5 py-1.5 text-[11px] font-semibold text-pulse2 transition-colors hover:bg-pulse/20"
                    >
                      <Dices className="h-3.5 w-3.5" />
                      Случайные магические заголовки
                    </button>
                  </div>
                </motion.div>
              </StepCard>
            </Reveal>

            <Reveal>
              <StepCard num="05" title="Аккаунт" hint="опционально">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-faint">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3" /> Имя устройства
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDeviceName(randomName());
                          toast("Имя устройства обновлено", "info");
                        }}
                        title="Случайное имя"
                        className="flex items-center gap-1 rounded-full border border-linebright/40 px-2 py-0.5 text-[10px] normal-case tracking-normal text-mist transition-colors hover:border-flare/60 hover:text-flare2"
                      >
                        <Dices className="h-3 w-3" />
                        случайное
                      </button>
                    </span>
                    <input
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value.slice(0, 15))}
                      placeholder="wvfwarp"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      <Sparkles className="h-3 w-3" /> Ключ WARP+
                    </span>
                    <input
                      value={warpKey}
                      onChange={(e) => setWarpKey(e.target.value.trim())}
                      placeholder="1a2b3C4D-…"
                      className={`${inputCls} font-mono`}
                    />
                  </label>
                </div>
              </StepCard>
            </Reveal>

            <Reveal>
              <button
                onClick={generate}
                disabled={!canGenerate}
                className={`glow-flare group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-flare via-[#ff8f33] to-[#ffa54d] px-8 py-5 text-[15px] font-extrabold text-void transition-all duration-300 ${
                  canGenerate
                    ? "hover:scale-[1.012] active:scale-[0.99]"
                    : "cursor-not-allowed opacity-40 saturate-50"
                }`}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {state === "working" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Генерация…
                  </>
                ) : mode === "split" && selected.length === 0 ? (
                  <>Выберите хотя бы один сервис</>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Сгенерировать конфигурацию
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-[11.5px] text-faint">
                <KeyRound className="h-3 w-3" />
                Приватный ключ создаётся локально и никуда не отправляется
              </p>
            </Reveal>
          </div>

          {/* правая колонка — результат */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.1}>
              <ResultPanel
                state={state}
                logs={logs}
                result={result}
                onDownload={() => result && downloadText(result.fileName, result.config)}
                onRegenerate={generate}
                canRegenerate={canGenerate}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Split2() {
  return <Route className="h-5 w-5" />;
}

function ModeButton({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? "border-flare/50 bg-gradient-to-br from-flare/[0.12] to-pulse/[0.06] shadow-[0_0_30px_rgba(255,125,31,0.12)]"
          : "border-line/70 hover:border-linebright/70 hover:bg-white/[0.03]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          active
            ? "border-flare/40 bg-flare/15 text-flare"
            : "border-linebright/40 text-mist group-hover:text-snow"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className={`block text-[13.5px] font-bold ${active ? "text-snow" : "text-mist"}`}>
          {title}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-faint">{desc}</span>
      </span>
      <span
        className={`absolute right-3.5 top-3.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${
          active ? "border-flare bg-flare" : "border-linebright/60"
        }`}
        style={{ width: 18, height: 18 }}
      >
        {active && <Check className="h-3 w-3 text-void" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

function Pill({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-lg border px-3.5 py-2 font-mono text-xs transition-all duration-200 ${
        active
          ? "border-pulse/60 bg-pulse/15 text-pulse2 shadow-[0_0_16px_rgba(63,227,255,0.15)]"
          : "border-linebright/40 text-mist hover:border-linebright hover:text-snow"
      }`}
    >
      {children}
    </button>
  );
}
