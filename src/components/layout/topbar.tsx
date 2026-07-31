'use client';

const TABS = [
  { id: 'generator', label: 'Генератор' },
  { id: 'formats', label: 'Форматы' },
  { id: 'about', label: 'О проекте' },
];

interface TopbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Topbar({ activeTab, onTabChange }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[var(--surface)] rounded-[var(--radius-lg)] mb-4 border border-[var(--border)] flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--accent-soft)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.5 5.5 0 104 15H3z" fill="white" />
          </svg>
        </div>
        <div>
          <span className="text-[15px] font-bold tracking-tight bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
            WVFWARP
          </span>
          <span className="text-[10px] text-[var(--text-dim)] ml-1.5 font-light">Generator</span>
        </div>
      </div>

      <nav className="flex gap-1 bg-[var(--surface-2)] rounded-lg p-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-md text-[13px] transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--surface-3)] text-[var(--text)] font-medium shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
