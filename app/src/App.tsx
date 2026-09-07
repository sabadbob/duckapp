import { useEffect, useState } from 'react';
import { useApp } from './store';
import { firebaseReady } from './firebase';
import { Shell } from './components/Shell';
import { DuckTab } from './tabs/DuckTab';
import { TodayTab } from './tabs/TodayTab';
import { FoodTab } from './tabs/FoodTab';
import { BodyTab } from './tabs/BodyTab';
import { WorkTab } from './tabs/WorkTab';
import { MoneyTab } from './tabs/MoneyTab';

const GUEST_CHOSEN_KEY = 'duckapp:guest-chosen';

function AuthGate({ onContinue }: { onContinue: () => void }) {
  const signInGoogle = useApp(s => s.signInGoogle);
  const [busy, setBusy] = useState(false);
  return (
    <div className="app-root">
      <div style={{ width: 390, background: 'var(--phone)', border: '2px solid var(--ink)', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ font: "400 30px/1.1 'Source Serif 4',serif" }}>Duck App</div>
        <div style={{ font: "400 15px/1.5 'Source Serif 4',serif", color: 'var(--slate)' }}>
          Sign in to sync your streak across devices and make The Flock work with real friends.
        </div>
        <button className="btn2 btn2o" disabled={busy} onClick={async () => { setBusy(true); try { await signInGoogle(); } finally { setBusy(false); } }}>
          {busy ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <button className="btn2" onClick={() => { localStorage.setItem(GUEST_CHOSEN_KEY, '1'); onContinue(); }}>
          Continue without an account
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { init, checkRollover, authReady, docReady, uid, guestMode } = useApp();
  const [guestChosen, setGuestChosen] = useState(() => localStorage.getItem(GUEST_CHOSEN_KEY) === '1');

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    const id = setInterval(() => checkRollover(), 60000);
    return () => clearInterval(id);
  }, [checkRollover]);

  const tab = useApp(s => s.tab);

  if (!authReady || !docReady) {
    return (
      <div className="app-root">
        <div style={{ width: 390, height: 200, display: 'grid', placeItems: 'center', font: "400 15px 'Source Serif 4',serif", color: 'var(--slate)' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (firebaseReady && !uid && guestMode && !guestChosen) {
    return <AuthGate onContinue={() => setGuestChosen(true)} />;
  }

  return (
    <Shell>
      {tab === 0 && <DuckTab />}
      {tab === 1 && <TodayTab />}
      {tab === 2 && <FoodTab />}
      {tab === 3 && <BodyTab />}
      {tab === 4 && <WorkTab />}
      {tab === 5 && <MoneyTab />}
    </Shell>
  );
}
