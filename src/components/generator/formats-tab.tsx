'use client';

import { CONFIG_FORMATS } from '@/config/formats';

export function FormatsTab() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)]">
      <h2 className="text-[16px] font-semibold text-[var(--text)] mb-4">Поддерживаемые форматы</h2>
      <div className="space-y-2">
        {CONFIG_FORMATS.map((f) => (
          <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] rounded-[var(--radius-md)]">
            <div>
              <span className="text-[14px] font-medium text-[var(--text)]">{f.name}</span>
              <span className="text-[12px] text-[var(--text-dim)] ml-2">.{f.extension}</span>
            </div>
            <span className={`text-[12px] px-2 py-0.5 rounded ${
              f.supportsQR ? 'text-[var(--success)] bg-[var(--success-soft)]' : 'text-[var(--text-dim)] bg-[var(--surface-3)]'
            }`}>
              {f.supportsQR ? 'QR ✓' : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
