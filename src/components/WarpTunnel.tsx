import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  kind: number; // 0 white-blue, 1 cyan, 2 orange
  size: number;
}

/** Полёт сквозь гиперпространство — звёздные стрелы из центра экрана */
export default function WarpTunnel({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let boost = 0;
    let boostTimer = 0;

    const onBoost = () => {
      boost = 1.6;
      boostTimer = 400;
    };
    window.addEventListener("wvf-boost", onBoost);

    const spawn = (initial = false): Star => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.65);
      const z = initial ? Math.random() : 1;
      const r = Math.random();
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.72,
        z,
        pz: z,
        kind: r < 0.62 ? 0 : r < 0.86 ? 1 : 2,
        size: 0.5 + Math.random() * 1.4,
      };
    };

    const COUNT = 340;
    const stars: Star[] = Array.from({ length: COUNT }, () => spawn(true));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let t = 0;
    const colors = [
      "rgba(190, 210, 255,", // white-blue
      "rgba(63, 227, 255,", // cyan
      "rgba(255, 145, 60,", // orange
    ];

    const frame = () => {
      t += 1;
      boostTimer -= 1;
      if (boostTimer <= 0) {
        boost = 1;
        boostTimer = 260 + Math.random() * 320;
      }
      boost *= 0.985;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(4, 6, 12, 0.5)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2 + mouse.x * 26;
      const cy = h / 2 + mouse.y * 18;
      const f = Math.min(w, h) * 0.92;
      const speed = 0.0055 + boost * 0.016;

      ctx.lineCap = "round";
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.02) {
          Object.assign(s, spawn());
          continue;
        }
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        const px = cx + (s.x / s.pz) * f;
        const py = cy + (s.y / s.pz) * f;

        if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) {
          Object.assign(s, spawn());
          continue;
        }

        const depth = 1 - s.z;
        const alpha = Math.min(0.85, depth * 1.15) * 0.75;
        ctx.strokeStyle = `${colors[s.kind]}${alpha.toFixed(3)})`;
        ctx.lineWidth = s.size * (0.4 + depth * 1.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      // свечение ядра туннеля
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.34);
      g.addColorStop(0, `rgba(63, 227, 255, ${0.05 + boost * 0.06})`);
      g.addColorStop(0.5, `rgba(255, 125, 31, ${0.025 + boost * 0.03})`);
      g.addColorStop(1, "rgba(4, 6, 12, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("wvf-boost", onBoost);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
