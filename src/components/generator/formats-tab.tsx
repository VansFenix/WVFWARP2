'use client';

import { CONFIG_FORMATS } from '@/config/formats';

export function FormatsTab() {
  return (
    <section className="generator-card overflow-hidden">
      <div className="generator-card-head px-5 py-5 sm:px-7">
        <div className="eyebrow inline-flex">Экспорт конфигураций</div>
        <h2 className="mt-4 text-[25px] font-bold tracking-[-.04em] text-[var(--text)]">Поддерживаемые форматы</h2>
        <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[var(--text-dim)]">
          Один генератор — разные клиенты. Выбери формат, который подходит твоему устройству.
        </p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
        {CONFIG_FORMATS.map((format, index) => (
          <div key={format.id} className="feature-card min-h-[165px] flex-col items-start justify-between">
            <div className="flex w-full items-center justify-between">
              <span className="text-[11px] font-bold tracking-[.16em] text-[var(--accent)]">0{index + 1}</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                format.supportsQR
                  ? 'bg-[var(--success-soft)] text-[var(--success)]'
                  : 'bg-[var(--surface-3)] text-[var(--text-dim)]'
              }`}>
                {format.supportsQR ? 'QR доступен' : 'Файл'}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text)]">{format.name}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-dim)]">{format.description}</p>
              <span className="mt-3 inline-block text-[10px] text-[var(--text-faint)]">.{format.extension}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
