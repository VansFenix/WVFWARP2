import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./ui";

const LINKS = [
  { href: "#generator", label: "Генератор" },
  { href: "#features", label: "Возможности" },
  { href: "#how", label: "Как это работает" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-flare via-flare2 to-pulse"
        style={{ scaleX: progress }}
      />
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <a href="#top" className="group flex items-center gap-3">
          <Logo />
          <span className="font-display text-[15px] font-bold tracking-[0.18em] text-snow">
            WVF<span className="grad-text">WARP</span>
          </span>
        </a>

        <nav
          className={`hidden items-center gap-1 rounded-full border px-2 py-1.5 transition-all duration-500 md:flex ${
            scrolled
              ? "glass border-linebright/40 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
              : "border-transparent"
          }`}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-mist transition-colors hover:bg-white/5 hover:text-snow"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#generator"
            className="group hidden items-center gap-2 rounded-full bg-gradient-to-r from-flare to-[#ff9d45] px-5 py-2.5 text-[13px] font-bold text-void shadow-[0_0_26px_rgba(255,125,31,0.35)] transition-all hover:shadow-[0_0_40px_rgba(255,125,31,0.55)] sm:inline-flex"
          >
            Создать конфиг
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-linebright/50 text-snow md:hidden"
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass mx-4 flex flex-col gap-1 rounded-2xl border-linebright/40 p-3 md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-mist hover:bg-white/5 hover:text-snow"
              >
                {l.label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
