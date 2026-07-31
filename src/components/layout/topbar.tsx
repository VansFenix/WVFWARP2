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
    <header className="topbar flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.5 5.5 0 104 15H3z" fill="white" />
            <path d="M12 9v5m0 0l-2-2m2 2l2-2" stroke="var(--accent-hover)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="brand-copy">
          <span>WVF<span className="brand-accent">WARP</span></span>
          <small>secure config studio</small>
        </div>
      </div>

      <nav className="topnav" aria-label="Основная навигация">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`topnav-item ${activeTab === tab.id ? 'topnav-item-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
