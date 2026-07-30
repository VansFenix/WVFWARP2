import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, TriangleAlert } from "lucide-react";
import { TOAST_EVENT, type ToastPayload, type ToastTone } from "./toast";

interface Item extends ToastPayload {
  id: number;
}

const ICONS: Record<ToastTone, typeof Check> = {
  ok: Check,
  info: Info,
  warn: TriangleAlert,
};

const TONES: Record<ToastTone, string> = {
  ok: "text-mint border-mint/30 bg-mint/15",
  info: "text-pulse2 border-pulse/30 bg-pulse/15",
  warn: "text-flare2 border-flare/30 bg-flare/15",
};

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-2), { id, ...detail }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2800);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[96] flex flex-col items-end gap-2">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass-bright pointer-events-auto flex items-center gap-3 rounded-2xl border-linebright/50 py-3 pl-3 pr-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${TONES[t.tone]}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold text-snow">{t.msg}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
