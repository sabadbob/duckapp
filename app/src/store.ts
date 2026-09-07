import { create } from 'zustand';
import {
  doc, onSnapshot, setDoc, serverTimestamp, collection,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth, db, googleProvider, firebaseReady } from './firebase';
import type {
  UserDoc, TabId, ChatLine, Order, TasteEntry, LedgerItem,
} from './types';
import { DEFAULT_LEDGER, DEFAULT_LIFTS, DEFAULT_WORK, SNACKS } from './data';
import { bangkokDateIso, bangkokDayIndex, currentWeekStartIso } from './lib/time';

const GUEST_KEY = 'duckapp:guest:v1';

function freshUserDoc(displayName: string): UserDoc {
  return {
    displayName,
    flockCode: null,
    streak: 0,
    best: 0,
    week: [-1, -1, -1, -1, -1, -1, -1],
    weekStartIso: currentWeekStartIso(),
    lastCloseDateIso: null,
    log: [],
    sort: 0,
    favs: [],
    orders: [],
    lifts: DEFAULT_LIFTS,
    taste: [],
    frames: [],
    filt: 0,
    synced: false,
    poked: [],
    fed: [],
    spent: 0,
    workDone: [],
    slipped: [],
    ledger: DEFAULT_LEDGER.map(i => ({ ...i })),
    ledgerDateIso: bangkokDateIso(),
    tomorrowPlan: [],
    sheetId: null,
    sheetSyncedAt: null,
    wantOverrides: {},
    proteinBase: 88,
    kcalBase: 1840,
    investedTotal: 0,
    investPosition: 0,
    placePhotos: {},
    repPoints: 0,
    workTodos: [],
  };
}

interface AppState extends UserDoc {
  uid: string | null;
  authReady: boolean;
  docReady: boolean;
  guestMode: boolean;
  tab: TabId;

  init: () => void;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  setTab: (t: TabId) => void;
  toggleLedgerItem: (i: number) => void;
  say: (you: string, duckLine: string) => void;
  didIt: (i: number) => void;
  cantDo: (i: number) => void;
  addPlanItem: (label: string, meta?: string) => void;
  removePlanItem: (i: number) => void;
  setInvestedTotal: (n: number) => void;
  setInvestPosition: (n: number) => void;
  setPlacePhoto: (placeId: string, url: string) => void;
  keepTaste: (id: string) => void;
  addTaste: (entry: Omit<TasteEntry, 'id' | 'createdAt'>) => void;
  addFrame: (url: string) => void;
  markWorkDone: (i: number) => void;
  flagSlip: (i: number) => void;
  buySnack: (id: string) => void;
  toggleFav: (placeId: string) => void;
  orderPlace: (name: string, kcal: number, baht: number) => void;
  adjustLift: (i: number, delta: number) => void;
  logSession: () => void;
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  setSort: (n: number) => void;
  setFilt: (n: number) => void;
  closeDay: () => void;
  checkRollover: () => void;
  poke: (targetUid: string, targetName: string) => void;
  setFlockCode: (code: string) => void;
  setSheetId: (id: string) => void;
  markSheetSynced: () => void;
  toggleWant: (category: string, currentlyWant: boolean) => void;
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleWrite(get: () => AppState) {
  if (!firebaseReady || !db) {
    persistGuest(get());
    return;
  }
  const { uid } = get();
  if (!uid) { persistGuest(get()); return; }
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const s = get();
    const payload = docFromState(s);
    void setDoc(doc(db!, 'users', uid), payload, { merge: true });
    void setDoc(doc(collection(db!, 'flocks', s.flockCode ?? '_none', 'members'), uid), {
      uid, name: s.displayName, streak: s.streak, best: s.best, updatedAt: Date.now(),
    }, { merge: true }).catch(() => {});
  }, 350);
}

function docFromState(s: AppState): UserDoc {
  const {
    displayName, flockCode, streak, best, week, weekStartIso, lastCloseDateIso, log, sort,
    favs, orders, lifts, taste, frames, filt, synced, poked, fed, spent, workDone, slipped, ledger,
    ledgerDateIso, tomorrowPlan, sheetId, sheetSyncedAt, proteinBase, kcalBase, wantOverrides,
    investedTotal, investPosition, placePhotos, repPoints, workTodos,
  } = s;
  return {
    displayName, flockCode, streak, best, week, weekStartIso, lastCloseDateIso, log, sort,
    favs, orders, lifts, taste, frames, filt, synced, poked, fed, spent, workDone, slipped, ledger,
    ledgerDateIso, tomorrowPlan, sheetId, sheetSyncedAt, proteinBase, kcalBase, wantOverrides,
    investedTotal, investPosition, placePhotos, repPoints, workTodos,
  };
}

function persistGuest(s: AppState) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(docFromState(s))); } catch { /* storage unavailable */ }
}

function loadGuest(): UserDoc | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function sassDidIt(label: string): string {
  const lines = [
    `"${label}" — logged. Try not to look so surprised at yourself.`,
    `"${label}" done. Don't make a whole ceremony out of it.`,
    `Noted: "${label}". I'm keeping count, don't worry.`,
    `Fine, "${label}" counts. Don't get used to praise.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}
function sassPostpone(label: string): string {
  const lines = [
    `"${label}" pushed to tomorrow. Honest beats silent — once, not a pattern.`,
    `Fine — "${label}" moves to tomorrow's list. It doesn't just vanish.`,
    `Noted. "${label}" carries over. I'm not thrilled, but lying about it would be worse.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

export const useApp = create<AppState>((set, get) => ({
  ...freshUserDoc('You'),
  uid: null,
  authReady: false,
  docReady: false,
  guestMode: true,
  tab: 0,

  init: () => {
    if (!firebaseReady || !auth || !db) {
      const guest = loadGuest();
      set({ authReady: true, docReady: true, guestMode: true, ...(guest ?? {}) });
      get().checkRollover();
      return;
    }
    onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        const guest = loadGuest();
        set({ uid: null, authReady: true, docReady: true, guestMode: true, ...(guest ?? {}) });
        return;
      }
      set({ uid: user.uid, authReady: true, guestMode: false, docReady: false });
      onSnapshot(doc(db!, 'users', user.uid), snap => {
        if (snap.exists()) {
          set({ ...(snap.data() as UserDoc), docReady: true });
        } else {
          const fresh = freshUserDoc(user.displayName ?? 'You');
          void setDoc(doc(db!, 'users', user.uid), fresh);
          set({ ...fresh, docReady: true });
        }
        get().checkRollover();
      });
    });
  },

  signInGoogle: async () => {
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  },
  signOutUser: async () => {
    if (!auth) return;
    await fbSignOut(auth);
  },

  setTab: (t) => set({ tab: t }),

  toggleLedgerItem: (i) => {
    set(s => ({
      ledger: s.ledger.map((it, n) => (n === i ? { ...it, done: !it.done, postponed: it.done ? it.postponed : false } : it)),
    }));
    scheduleWrite(get);
  },

  say: (you, duckLine) => {
    set(s => ({ log: [...s.log, { you, duck: duckLine } as ChatLine] }));
    scheduleWrite(get);
  },
  didIt: (i) => {
    const item = get().ledger[i];
    if (!item) return;
    set(s => ({ ledger: s.ledger.map((it, n) => (n === i ? { ...it, done: true, postponed: false } : it)) }));
    get().say('Did it', sassDidIt(item.label));
  },
  cantDo: (i) => {
    const item = get().ledger[i];
    if (!item) return;
    set(s => ({ ledger: s.ledger.map((it, n) => (n === i ? { ...it, postponed: true } : it)) }));
    get().say("Can't today", sassPostpone(item.label));
  },

  addPlanItem: (label, meta) => {
    if (!label.trim()) return;
    set(s => ({ tomorrowPlan: [...s.tomorrowPlan, { label: label.trim(), meta: meta ?? '' }] }));
    scheduleWrite(get);
  },
  removePlanItem: (i) => {
    set(s => ({ tomorrowPlan: s.tomorrowPlan.filter((_, n) => n !== i) }));
    scheduleWrite(get);
  },
  setInvestedTotal: (n) => { set({ investedTotal: Math.max(0, n) }); scheduleWrite(get); },
  setInvestPosition: (n) => { set({ investPosition: Math.max(0, n) }); scheduleWrite(get); },
  setPlacePhoto: (placeId, url) => {
    set(s => ({ placePhotos: { ...s.placePhotos, [placeId]: url } }));
    scheduleWrite(get);
  },

  keepTaste: (id) => {
    set(s => ({ taste: s.taste.map(t => (t.id === id ? { ...t, kept: !t.kept } : t)) }));
    scheduleWrite(get);
  },
  addTaste: (entry) => {
    set(s => ({ taste: [...s.taste, { ...entry, id: crypto.randomUUID(), createdAt: Date.now() }] }));
    scheduleWrite(get);
  },
  addFrame: (url) => {
    set(s => ({ frames: [...s.frames, { id: crypto.randomUUID(), url, ts: Date.now(), caption: '' }] }));
    scheduleWrite(get);
  },

  markWorkDone: (i) => {
    set(s => ({
      workDone: s.workDone.includes(i) ? s.workDone : [...s.workDone, i],
      slipped: s.slipped.filter(x => x !== i),
    }));
    scheduleWrite(get);
  },
  flagSlip: (i) => {
    set(s => ({
      slipped: s.slipped.includes(i) ? s.slipped.filter(x => x !== i) : [...s.slipped, i],
      workDone: s.workDone.filter(x => x !== i),
    }));
    scheduleWrite(get);
  },

  buySnack: (id) => {
    const s = get();
    const snack = SNACKS.find(k => k.id === id);
    if (!snack || s.fed.includes(id)) return;
    const pts = computePoints(s);
    if (pts < snack.cost) return;
    set(st => ({ fed: [...st.fed, id], spent: st.spent + snack.cost }));
    scheduleWrite(get);
  },

  toggleFav: (placeId) => {
    set(s => ({ favs: s.favs.includes(placeId) ? s.favs.filter(x => x !== placeId) : [...s.favs, placeId] }));
    scheduleWrite(get);
  },
  orderPlace: (name, kcal, baht) => {
    set(s => ({ orders: [...s.orders, { name, kcal, baht, ts: Date.now() } as Order] }));
    scheduleWrite(get);
  },

  // Points scale with actual reps done: +1 point per rep added, and undoing
  // a tap takes the point back (clamped at 0) so spamming +1/-1 can't farm it.
  adjustLift: (i, delta) => {
    set(s => {
      const lift = s.lifts[i];
      if (!lift) return s;
      const newReps = Math.max(0, lift.reps + delta);
      const actualDelta = newReps - lift.reps;
      return {
        lifts: s.lifts.map((l, n) => (n === i ? { ...l, reps: newReps } : l)),
        repPoints: Math.max(0, s.repPoints + actualDelta),
      };
    });
    scheduleWrite(get);
  },
  logSession: () => {
    set(s => ({ ledger: s.ledger.map((it, n) => (n === 0 ? { ...it, done: true } : it)), repPoints: s.repPoints + 15 }));
    get().say('Logged the session', 'Reps are up. That is the whole game without a gym — same movement, one more rep, every week.');
  },

  addTodo: (label) => {
    if (!label.trim()) return;
    set(s => ({ workTodos: [...s.workTodos, { id: crypto.randomUUID(), label: label.trim(), done: false, createdAt: Date.now() }] }));
    scheduleWrite(get);
  },
  toggleTodo: (id) => {
    set(s => ({ workTodos: s.workTodos.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }));
    scheduleWrite(get);
  },
  removeTodo: (id) => {
    set(s => ({ workTodos: s.workTodos.filter(t => t.id !== id) }));
    scheduleWrite(get);
  },

  setSort: (n) => set({ sort: n }),
  setFilt: (n) => set({ filt: n }),

  closeDay: () => {
    const s = get();
    const todayIdx = bangkokDayIndex();
    if (s.week[todayIdx] !== -1) return; // already resolved today
    const week = [...s.week] as UserDoc['week'];
    week[todayIdx] = 1;
    const streak = s.streak + 1;
    set({ week, streak, best: Math.max(s.best, streak), lastCloseDateIso: bangkokDateIso() });
    scheduleWrite(get);
  },

  // The midnight rule: if a Bangkok day has ended and its week slot never got
  // resolved by closeDay(), the streak is decided automatically —
  // survives (half-credit) if every P1 deliverable was at least flagged as a
  // slip or marked done; breaks to zero otherwise. Runs on load and every tick
  // from the interval set up in App.tsx.
  checkRollover: () => {
    const s = get();
    const todayWeekStart = currentWeekStartIso();
    let patch: Partial<AppState> = {};

    if (s.weekStartIso !== todayWeekStart) {
      // A new ISO week has started — resolve any still-pending slot from last
      // week as broken (missed entirely), then start a fresh 7-slot week.
      patch = { ...patch, week: [-1, -1, -1, -1, -1, -1, -1], weekStartIso: todayWeekStart };
    }

    if (s.ledgerDateIso !== bangkokDateIso()) {
      const todayIdx = bangkokDayIndex();
      const week = (patch.week ?? s.week) as UserDoc['week'];
      const yIdx = todayIdx === 0 ? 6 : todayIdx - 1;
      if (week[yIdx] === -1 && s.ledgerDateIso) {
        // Yesterday's slot was never resolved by the user — the midnight rule decides it.
        // Streak survives only if every P1 deliverable was marked done or flagged as a slip.
        const p1Indices = DEFAULT_WORK.reduce<number[]>((acc, w, i) => (w.p === 'P1' ? [...acc, i] : acc), []);
        const survived = p1Indices.every(i => s.workDone.includes(i) || s.slipped.includes(i));
        const newWeek = [...week] as UserDoc['week'];
        if (survived) {
          newWeek[yIdx] = 1;
          patch = { ...patch, week: newWeek, streak: s.streak + 1, best: Math.max(s.best, s.streak + 1) };
        } else {
          newWeek[yIdx] = 0;
          patch = { ...patch, week: newWeek, streak: 0 };
        }
      }
      // New day's ledger: carry over anything postponed yesterday, then add
      // whatever was written in "Plan tomorrow", then fall back to the
      // default list if neither left anything behind.
      const carried: LedgerItem[] = s.ledger
        .filter(it => it.postponed && !it.done)
        .map(it => ({ label: it.label, meta: it.meta, done: false }));
      const planned: LedgerItem[] = s.tomorrowPlan.map(p => ({ label: p.label, meta: p.meta || 'PLANNED', done: false }));
      const nextLedger = [...carried, ...planned];

      patch = {
        ...patch,
        ledger: nextLedger.length ? nextLedger : DEFAULT_LEDGER.map(i => ({ ...i } as LedgerItem)),
        ledgerDateIso: bangkokDateIso(),
        tomorrowPlan: [],
        workDone: [],
        slipped: [],
      };
    }

    if (Object.keys(patch).length) {
      set(patch);
      scheduleWrite(get);
    }
  },

  poke: (targetUid, targetName) => {
    set(s => ({ poked: s.poked.includes(targetUid) ? s.poked : [...s.poked, targetUid] }));
    if (firebaseReady && db) {
      const s = get();
      void setDoc(doc(collection(db, 'pokes'), `${targetUid}_${s.uid ?? 'guest'}_${Date.now()}`), {
        from: s.uid ?? 'guest', fromName: s.displayName, to: targetUid, ts: serverTimestamp(),
      }).catch(() => {});
    }
    void targetName;
  },

  setFlockCode: (code) => { set({ flockCode: code || null }); scheduleWrite(get); },
  setSheetId: (id) => { set({ sheetId: id || null }); scheduleWrite(get); },
  markSheetSynced: () => { set({ sheetSyncedAt: Date.now(), synced: true }); scheduleWrite(get); },
  toggleWant: (category, currentlyWant) => {
    set(s => ({ wantOverrides: { ...s.wantOverrides, [category]: !currentlyWant } }));
    scheduleWrite(get);
  },
}));

export function computePoints(s: UserDoc): number {
  const closedDays = s.week.filter(v => v === 1).length;
  const ledgerDone = s.ledger.filter(i => i.done).length;
  return closedDays * 15 + (ledgerDone + s.workDone.length) * 10 + s.repPoints - s.spent;
}
