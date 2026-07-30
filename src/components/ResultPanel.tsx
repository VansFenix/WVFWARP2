import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Download,
  FileCode2,
  History,
  Loader2,
  QrCode as QrIcon,
  Radar,
  RefreshCw,
  ScanLine,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { downloadText, type GenerateResult } from "../lib/warp";
import type { GenState } from "./Generator";
import { toast } from "./fx/toast";
import { GhostChip } from "./ui";

interface HistoryItem {
  fp: string;
  name: string;
  ts: number;
  config: string;
}

const HISTORY_KEY = "wvf:history";

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export interface LogEntry {
  ts: string;
  msg: string;
  kind: "info" | "ok" | "warn" | "err";
}

type Tab = "config" | "qr";

export default function ResultPanel({
  state,
  logs,
  result,
  onDownload,
  onRegenerate,
  canRegenerate,
}: {
  state: GenState;
  logs: LogEntry[];
  result: GenerateResult | null;
  onDownload: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
}) {
  const [tab, setTab] = useState<Tab>("config");
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (state === "done" && result) {
      setHistory((prev) => {
        const next = [
          { fp: result.fingerprint, name: result.fileName, ts: Date.now(), config: result.config },
          ...prev.filter((h) => h.fp !== result.fingerprint),
        ].slice(0, 3);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* localStorage недоступен */
        }
        return next;
      });
    }
  }, [state, result]);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* noop */
    }
    toast("История очищена", "info");
  };

  useEffect(() => {
    if (state === "done" && result) {
      setTab("config");
      setQr(null);
      setQrError(null);
      QRCode.toDataURL(result.qrText, {
        width: 560,
        margin: 1,
        errorCorrectionLevel: "L",
        color: { dark: "#0b1220", light: "#ffffff" },
      })
        .then(setQr)
        .catch(() => setQrError("Конфигурация слишком длинная для одного QR-кода"));
    }
  }, [state, result]);

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.config);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.config;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast("Конфигурация скопирована");
  };

  return (
    <div className="glass-bright noise relative flex min-h-[560px] flex-col overflow-hidden rounded-3xl">
      {/* шапка */}
      <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-flare2/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
          </span>
          <span className="ml-2 font-mono text-[11px] tracking-wider text-faint">
            wvfwarp://output
          </span>
        </div>
        <div className="flex items-center gap-2">
          {state === "done" && result && (
            <>
              <GhostChip tone={result.offline ? "flare" : "mint"}>
                {result.offline ? "offline" : "live"}
              </GhostChip>
              <GhostChip tone="pulse">{result.fingerprint}</GhostChip>
            </>
          )}
          {state === "working" && (
            <GhostChip tone="flare">
              <Loader2 className="h-3 w-3 animate-spin" />
              работа
            </GhostChip>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ---------- пустое состояние ---------- */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-pulse/10 [animation-duration:2.4s]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-linebright/50 bg-panel">
                <Radar className="h-8 w-8 text-pulse animate-pulsesoft" />
              </div>
              <div className="absolute -inset-6 rounded-full border border-dashed border-linebright/30 animate-orbit" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-snow">
                Здесь появится конфигурация
              </p>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-faint">
                Настройте параметры слева и нажмите «Сгенерировать» — ключи,
                регистрация и сборка займут несколько секунд
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <GhostChip>curve25519</GhostChip>
              <GhostChip>wireguard</GhostChip>
              <GhostChip>amneziawg</GhostChip>
            </div>
          </motion.div>
        )}

        {/* ---------- процесс ---------- */}
        {state === "working" && (
          <motion.div
            key="working"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            <div className="h-0.5 w-full overflow-hidden bg-void">
              <div className="h-full w-1/3 animate-[scanline_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-pulse to-transparent" />
            </div>
            <div
              ref={logRef}
              className="config-scroll flex-1 space-y-3 overflow-y-auto px-6 py-6 font-mono text-[12.5px]"
            >
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3"
                >
                  <span className="shrink-0 text-faint">{l.ts}</span>
                  <LogIcon kind={l.kind} last={i === logs.length - 1} />
                  <span
                    className={
                      l.kind === "ok"
                        ? "text-mint"
                        : l.kind === "warn"
                          ? "text-flare2"
                          : l.kind === "err"
                            ? "text-rose"
                            : "text-mist"
                    }
                  >
                    {l.msg}
                  </span>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 pl-[88px]">
                <span className="inline-block h-3.5 w-2 animate-pulsesoft bg-pulse/80" />
              </div>
            </div>
            <p className="border-t border-line/70 px-6 py-4 text-center text-[11px] text-faint">
              Ключи не покидают браузер · регистрация идёт напрямую в Cloudflare
            </p>
          </motion.div>
        )}

        {/* ---------- результат ---------- */}
        {state === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            {/* вкладки */}
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="flex gap-1 rounded-full border border-linebright/40 bg-void/50 p-1">
                <TabButton
                  active={tab === "config"}
                  onClick={() => setTab("config")}
                  icon={<FileCode2 className="h-3.5 w-3.5" />}
                  label="Конфиг"
                />
                <TabButton
                  active={tab === "qr"}
                  onClick={() => setTab("qr")}
                  icon={<QrIcon className="h-3.5 w-3.5" />}
                  label="QR-код"
                />
              </div>
              <span className="font-mono text-[10.5px] text-faint">{result.fileName}</span>
            </div>

            <div className="px-5 pb-5 pt-4">
              {tab === "config" ? (
                <>
                  <div className="relative overflow-hidden rounded-2xl border border-linebright/40 bg-void/80">
                    <div className="pointer-events-none absolute inset-x-0 h-16 animate-scanline bg-gradient-to-b from-transparent via-pulse/[0.04] to-transparent" />
                    <pre className="config-scroll max-h-[330px] overflow-auto px-5 py-4 font-mono text-[11.5px] leading-[1.75]">
                      {result.config.split("\n").map((line, i) => (
                        <ConfigLine key={i} line={line} />
                      ))}
                    </pre>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MetaChip label="тип" value={result.accountLabel} />
                    <MetaChip label="endpoint" value={result.endpoint} />
                    <MetaChip
                      label="маршрутов"
                      value={result.allowedCount > 2 ? String(result.allowedCount) : "весь трафик"}
                    />
                    <MetaChip label="IPv4" value={result.ipv4} />
                  </div>

                  {result.offline && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-flare/30 bg-flare/[0.07] px-4 py-3">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flare2" />
                      <p className="text-[11.5px] leading-relaxed text-flare2/90">
                        Автономный режим: API Cloudflare не ответил, поэтому конфиг собран
                        с локальными ключами. Для полноценной регистрации перегенерируйте
                        при доступном соединении.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-2">
                  {qrError ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                      <p className="text-[11.5px] text-rose/90">{qrError}</p>
                    </div>
                  ) : qr ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl bg-white p-3.5 glow-pulse"
                    >
                      <img src={qr} alt="QR-код конфигурации" className="h-56 w-56" />
                      <ScanLine className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-void p-1 text-pulse" />
                    </motion.div>
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-linebright/50">
                      <Loader2 className="h-6 w-6 animate-spin text-pulse" />
                    </div>
                  )}
                  <p className="max-w-xs text-center text-[11.5px] leading-relaxed text-faint">
                    В WireGuard или AmneziaVPN на телефоне: «+» → «Создать из QR-кода» →
                    наведите камеру
                  </p>
                </div>
              )}
            </div>

            {/* действия */}
            <div className="mt-auto flex items-center gap-2 border-t border-line/70 px-5 py-4">
              <button
                onClick={copy}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-bold transition-all ${
                  copied
                    ? "border-mint/50 bg-mint/15 text-mint"
                    : "border-linebright/50 text-snow hover:border-pulse/60 hover:text-pulse2"
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Скопировано" : "Копировать"}
              </button>
              <button
                onClick={onDownload}
                className="glow-flare inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flare to-[#ff9d45] px-4 py-3 text-[13px] font-extrabold text-void transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Скачать .conf
              </button>
              <button
                onClick={onRegenerate}
                disabled={!canRegenerate}
                title="Сгенерировать заново"
                className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-linebright/50 text-mist transition-colors hover:border-flare/60 hover:text-flare2 disabled:opacity-40"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* история */}
            {history.length > 0 && (
              <div className="border-t border-line/70 px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                    <History className="h-3 w-3" />
                    Недавние конфиги
                  </span>
                  <button
                    onClick={clearHistory}
                    title="Очистить историю"
                    className="text-faint transition-colors hover:text-rose"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="config-scroll mt-2.5 flex gap-2 overflow-x-auto pb-1">
                  {history.map((h) => (
                    <button
                      key={h.fp}
                      onClick={() => {
                        downloadText(h.name, h.config);
                        toast(`Сохранён ${h.name}`);
                      }}
                      title={`Скачать ${h.name} · ${new Date(h.ts).toLocaleString("ru-RU")}`}
                      className="group flex shrink-0 items-center gap-2 rounded-xl border border-linebright/40 bg-panel/60 px-3 py-2 transition-all hover:border-pulse/50 hover:bg-pulse/[0.06]"
                    >
                      <span className="font-mono text-[10.5px] text-pulse2">{h.fp}</span>
                      <span className="max-w-[80px] truncate text-[10.5px] text-faint">{h.name}</span>
                      <Download className="h-3 w-3 text-faint transition-colors group-hover:text-pulse2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogIcon({ kind, last }: { kind: LogEntry["kind"]; last: boolean }) {
  if (last && kind === "info") return <Loader2 className="mt-0.5 h-3.5 w-3.5 animate-spin text-pulse" />;
  if (kind === "ok") return <Check className="mt-0.5 h-3.5 w-3.5 text-mint" />;
  if (kind === "warn") return <TriangleAlert className="mt-0.5 h-3.5 w-3.5 text-flare2" />;
  if (kind === "err") return <X className="mt-0.5 h-3.5 w-3.5 text-rose" />;
  return <Check className="mt-0.5 h-3.5 w-3.5 text-mint" />;
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
        active ? "bg-white/10 text-snow shadow-inner" : "text-faint hover:text-mist"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 bg-panel/60 px-2.5 py-1.5 font-mono text-[10px]">
      <span className="uppercase tracking-wider text-faint">{label}</span>
      <span className="text-pulse2">{value}</span>
    </span>
  );
}

function ConfigLine({ line }: { line: string }) {
  if (line.startsWith("#")) return <div className="text-faint/80">{line}</div>;
  if (line.startsWith("[") && line.endsWith("]"))
    return <div className="font-bold text-pulse">{line}</div>;
  if (!line.trim()) return <div>&nbsp;</div>;
  const eq = line.indexOf(" = ");
  if (eq === -1) return <div className="text-mist">{line}</div>;
  const key = line.slice(0, eq);
  const val = line.slice(eq + 3);
  return (
    <div>
      <span className="text-flare2/90">{key}</span>
      <span className="text-faint"> = </span>
      <span className="text-snow/90">{val}</span>
    </div>
  );
}
