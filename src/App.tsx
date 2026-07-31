import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Generator from "./components/Generator";
import { Faq, Features, Footer, HowItWorks, StatsStrip } from "./components/Sections";
import { DividerMarquee } from "./components/ui";
import Preloader from "./components/fx/Preloader";
import Cursor from "./components/fx/Cursor";
import Toaster from "./components/fx/Toaster";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-void font-sans text-snow">
      <AnimatePresence>{loading && <Preloader />}</AnimatePresence>
      <Cursor />
      <Toaster />
      <div className="noise pointer-events-none fixed inset-0 z-[60]" />
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Generator />
        <DividerMarquee words={["tunnel", "encrypt", "route", "obfuscate"]} />
        <Features />
        <HowItWorks />
        <DividerMarquee words={["warp", "privacy", "freedom", "wvfwarp"]} reverse />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
