'use client';

import type { ServiceEntry } from '@/types';
import { ServiceIcon } from '@/components/icons/icon-resolver';

interface ServicePickerProps {
  services: ServiceEntry[];
  selected: string[];
  onToggle: (key: string) => void;
}

export function ServicePicker({ services, selected, onToggle }: ServicePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3.5">
      {services.map((service) => {
        const isActive = selected.includes(service.key);
        return (
          <button
            key={service.key}
            type="button"
            onClick={() => onToggle(service.key)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] transition-all text-left border ${
              isActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-[var(--accent)]/30'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] border-transparent'
            }`}
          >
            <ServiceIcon icon={service.icon} className="w-4 h-4 shrink-0" />
            <span className="truncate">{service.name}</span>
            {service.type === 'new' && (
              <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-1 py-0.5 rounded">NEW</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
