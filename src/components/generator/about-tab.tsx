'use client';

const TECH = [
  'WireGuard / AmneziaWG',
  'Clash Meta',
  'WireSock masking',
  'Мультиформатный экспорт',
  'Split DNS',
  'IPv6 ready',
];

export function AboutTab() {
  return (
    <section className="generator-card overflow-hidden">
      <div className="generator-card-head px-5 py-6 sm:px-7 sm:py-8">
        <div className="eyebrow inline-flex">WVF / WARP / STUDIO</div>
        <h2 className="mt-5 max-w-[680px] text-[clamp(2rem,5vw,4rem)] font-bold leading-[.98] tracking-[-.07em] text-[var(--text)]">
          Свободный интернет,
          <span className="hero-title-accent"> аккуратные настройки.</span>
        </h2>
        <p className="mt-5 max-w-[620px] text-[14px] leading-[1.75] text-[var(--text-dim)]">
          WVFWARP — минималистичный генератор конфигураций Cloudflare WARP.
          Никаких аккаунтов и лишних шагов: только понятные параметры, безопасное соединение и готовый файл.
        </p>
      </div>
      <div className="p-5 sm:p-7">
        <div className="form-section-label"><span>Возможности</span><i /></div>
        <div className="mb-7 flex flex-wrap gap-2">
          {TECH.map((item) => (
            <span key={item} className="tech-chip rounded-full border border-[#a78bfa24] bg-[#a78bfa0b] px-3 py-2 text-[11px] text-[#c4b5fd]">
              {item}
            </span>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="feature-card"><b className="text-[var(--text)]">Приватность</b><p>Конфиг создаётся по запросу</p></div>
          <div className="feature-card"><b className="text-[var(--text)]">Гибкость</b><p>Маршруты для любых задач</p></div>
          <div className="feature-card"><b className="text-[var(--text)]">Простота</b><p>Скачивание одним нажатием</p></div>
        </div>
        <p className="mt-7 text-[11px] text-[var(--text-dim)]">WVFWARP · создано для удобного подключения</p>
      </div>
    </section>
  );
}
