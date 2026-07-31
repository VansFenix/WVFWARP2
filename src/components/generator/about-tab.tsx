'use client';

import { FaGithub } from 'react-icons/fa';

const TECH = [
  'Поддержка WireGuard / AmneziaWG',
  'Clash Meta конфигурации',
  'WireSock с маскировкой',
  'Мультиформатный экспорт',
  'Split DNS поддержка',
  'IPv6 совместимость',
];

export function AboutTab() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)]">
      <h2 className="text-[16px] font-semibold text-[var(--text)] mb-3">О проекте</h2>
      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-5">
        Генератор конфигураций Cloudflare WARP. Создавайте конфиги для оптимизации сетевого подключения,
        повышения безопасности и защиты трафика. Поддержка множества форматов и платформ.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {TECH.map((t) => (
          <span key={t} className="text-[12px] px-3 py-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-dim)] border border-[var(--border)]">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
        <span>MIT License · WVFWARP</span>
      </div>
    </div>
  );
}
