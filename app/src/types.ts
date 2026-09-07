// Core data model — mirrors the state shape from the Duck App.dc.html prototype,
// extended with fields for real Firestore persistence and multi-user flock sync.

export interface LedgerItem {
  label: string;
  meta: string;
  done: boolean;
  postponed?: boolean; // carried to tomorrow via "Can't today" on this specific task
}

export interface Lift {
  name: string;
  reps: number;
  last: number;
  scheme: string;
  next: string;
}

export interface Order {
  name: string;
  kcal: number;
  baht: number;
  ts: number;
}

export interface ChatLine {
  you: string;
  duck: string;
}

export interface WorkItem {
  p: 'P1' | 'P2' | 'P3';
  name: string;
  due: string;
  needs: string;
}

export interface TasteEntry {
  id: string;
  imageUrl: string | null;
  caption: string;
  kept: boolean;
  createdAt: number;
}

export interface Frame {
  id: string;
  url: string;
  ts: number;
  caption: string;
}

export interface Todo {
  id: string;
  label: string;
  done: boolean;
  createdAt: number;
}

// Persisted per-user document: users/{uid}
export interface UserDoc {
  displayName: string;
  flockCode: string | null;
  streak: number;
  best: number;
  week: (1 | 0 | -1)[]; // 1 closed, 0 broken, -1 pending, indexed Mon..Sun
  weekStartIso: string; // ISO date of this week's Monday, for rollover detection
  lastCloseDateIso: string | null;
  log: ChatLine[];
  sort: number;
  favs: string[];
  orders: Order[];
  lifts: Lift[];
  taste: TasteEntry[];
  frames: Frame[];
  filt: number;
  synced: boolean;
  poked: string[];
  fed: string[];
  spent: number;
  workDone: number[];
  slipped: number[];
  ledger: LedgerItem[];
  ledgerDateIso: string | null; // for daily ledger rollover
  tomorrowPlan: { label: string; meta: string }[]; // written today, becomes tomorrow's ledger on rollover
  sheetId: string | null; // Google Sheet id for MONEY sync
  sheetSyncedAt: number | null;
  wantOverrides: Record<string, boolean>; // category name -> true if it's a "want", overrides the default guess
  proteinBase: number;
  kcalBase: number;
  investedTotal: number; // manually-tracked, since the tracker has no brokerage data
  investPosition: number;
  placePhotos: Record<string, string>; // place id -> your own uploaded photo, for seed places without a live Places photo
  repPoints: number; // earned from BODY rep increments, folds into total Duck Points
  workTodos: Todo[]; // free-form to-dos in WORK, separate from the fixed P1/P2/P3 deliverables
}

// Denormalized row written to flocks/{code}/members/{uid} whenever streak/best change
export interface FlockMember {
  uid: string;
  name: string;
  streak: number;
  best: number;
  updatedAt: number;
}

export interface Poke {
  from: string;
  fromName: string;
  to: string;
  ts: number;
}

export interface Snack {
  id: string;
  name: string;
  cost: number;
  effect: string;
  d: string; // svg path
}

export interface Place {
  id: string;
  name: string;
  desc: string;
  eta: number;
  rating: number;
  baht: number;
  kcal: number;
  band: string;
  photoUrl?: string | null;
  lat?: number;
  lng?: number;
  source: 'seed' | 'google';
}

export interface SpendLine {
  name: string;
  amt: number;
  cat: string;
  need: boolean;
}

export type TabId = 0 | 1 | 2 | 3 | 4 | 5; // DUCK TODAY WORK BODY MONEY FOOD
