import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../store';
import type { TabId } from '../types';
import { bangkokTimeLabel, headerDateLabel } from '../lib/time';

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 0, label: 'DUCK', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="10" cy="15" r="6" /><circle cx="15" cy="8" r="4" /><path d="M18 7h4" />
    </svg>
  ) },
  { id: 1, label: 'TODAY', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square">
      <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" />
    </svg>
  ) },
  { id: 4, label: 'WORK', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square">
      <path d="M4 20V9" /><path d="M11 20V4" /><path d="M18 20v-7" />
    </svg>
  ) },
  { id: 3, label: 'BODY', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square">
      <path d="M3 8v8" /><path d="M7 5v14" /><path d="M17 5v14" /><path d="M21 8v8" /><path d="M7 12h10" />
    </svg>
  ) },
  { id: 5, label: 'MONEY', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square">
      <rect x="2.5" y="6.5" width="19" height="11" /><circle cx="12" cy="12" r="2.6" />
    </svg>
  ) },
  { id: 2, label: 'FOOD', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square">
      <path d="M5 3v18" /><path d="M9 3v6a4 4 0 0 1-4 4" /><path d="M15 21V3c3 0 4 3 4 6s-1 5-4 5" />
    </svg>
  ) },
];

export function Shell({ children }: { children: ReactNode }) {
  const tab = useApp(s => s.tab);
  const setTab = useApp(s => s.setTab);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-root">
      <div style={{
        width: 390, background: 'var(--phone)', border: '2px solid var(--ink)', height: 844,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px 8px',
          font: "600 10.5px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)',
        }}>
          <span>{bangkokTimeLabel(now)}</span>
          <span>{headerDateLabel(now)}</span>
        </div>

        {children}

        <div style={{
          borderTop: '2px solid var(--ink)', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)',
          background: 'var(--phone)', flex: 'none',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className="tab"
              style={{
                background: tab === t.id ? 'var(--ink)' : 'transparent',
                color: tab === t.id ? 'var(--cream)' : 'var(--slate)',
              }}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TabScroll({ children }: { children: ReactNode }) {
  return (
    <div style={{ borderTop: '2px solid var(--ink)', flex: 1, minHeight: 0, overflow: 'auto' }}>
      {children}
    </div>
  );
}
