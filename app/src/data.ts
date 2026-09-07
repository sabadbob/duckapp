// Static seed data ported verbatim from Duck App.dc.html's Component class statics.
// SNACKS, work items and spend lines are personal to George and stay as sensible
// defaults he can edit in-app. PLACES is the fallback used only if Google Places
// isn't configured (see integrations/places.ts).

import type { Snack, SpendLine, WorkItem, Place, Lift, LedgerItem } from './types';

export const SNACKS: Snack[] = [
  { id: 'crumb', name: 'Bread crumb', cost: 20, effect: 'BASIC · KEEPS HIM QUIET', d: 'M5 14h14M7 14a5 5 0 0 1 10 0' },
  { id: 'cracker', name: 'Rice cracker', cost: 45, effect: 'CRUNCH · SMUG FOR A DAY', d: 'M4 4h16v16H4zM9 9h6v6H9z' },
  { id: 'sesame', name: 'Sesame ball', cost: 80, effect: 'ROUND · VISIBLY ROUNDER', d: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16' },
  { id: 'mango', name: 'Mango sticky rice', cost: 140, effect: 'PREMIUM · NEW BOW TIE', d: 'M4 18h16M6 18c0-6 12-6 12 0M10 6h4' },
  { id: 'roti', name: 'Roti, extra condensed milk', cost: 220, effect: 'ELITE · TOP HAT UNLOCK', d: 'M3 8h18v4a9 9 0 0 1-18 0zM7 8V5h10v3' },
];

// Verified against real listings (Michelin Guide Thailand, restaurant sites) —
// prices/hours are real ranges, not guesses. Still "seed" until Places API is
// configured, since that's the only source that can keep them current automatically.
export const SEED_PLACES: Place[] = [
  { id: 'p1', name: 'Jeh O Chula', desc: 'Michelin Bib Gourmand. Mama tom yum, open 17:30–01:00 — the queue is the point.', eta: 12, rating: 4.8, baht: 250, kcal: 780, band: '฿฿', source: 'seed' },
  { id: 'p2', name: 'Somtum Der', desc: 'Michelin-listed Isaan. 20 papaya salad styles from ฿50, laab and tom saep.', eta: 18, rating: 4.6, baht: 120, kcal: 620, band: '฿', source: 'seed' },
  { id: 'p3', name: 'Bonchon Siam', desc: 'Korean fried chicken chain. Protein, technically.', eta: 9, rating: 4.2, baht: 320, kcal: 1100, band: '฿฿฿', source: 'seed' },
  { id: 'p4', name: 'Kuay Jab Ouan Pochana', desc: 'Peppery rolled noodle soup, open late.', eta: 22, rating: 4.7, baht: 90, kcal: 540, band: '฿', source: 'seed' },
  { id: 'p5', name: 'Ohkajhu', desc: 'Farm-to-table, own organic farm in Chiang Mai. Siam Square One branch. Big salads.', eta: 26, rating: 4.5, baht: 240, kcal: 480, band: '฿฿', source: 'seed' },
];

export const DEFAULT_WORK: WorkItem[] = [
  { p: 'P1', name: 'Arch Design II — pin-up', due: 'FRI 09:00', needs: 'Site model 1:200, two sections inked, board layout. Model not started.' },
  { p: 'P1', name: 'CV Tennis Shop — client set', due: 'WED', needs: 'Plan + court section, badminton bay dimensions confirmed with Aj Paul.' },
  { p: 'P2', name: 'TRECC — tenant mix model', due: 'SUN', needs: 'Rental revenue per zone in Excel, anchor vs F&B split, one sensitivity case.' },
  { p: 'P2', name: 'Pattaya market study', due: 'NEXT WK', needs: 'Beachfront vs near-beach ฿/sqm table, affordability layers, three comps.' },
  { p: 'P3', name: 'Condo smart-home layout', due: 'OPEN', needs: 'Device plan per room, then the documentation shoot for the channel.' },
];

export const DEFAULT_SPEND: SpendLine[] = [
  { name: 'Condo rent + water', amt: 8500, cat: 'FIXED', need: true },
  { name: 'Food — cooked + delivery', amt: 6000, cat: 'FOOD', need: true },
  { name: 'BTS + Grab to studio', amt: 1200, cat: 'TRAVEL', need: true },
  { name: 'Phone + internet', amt: 400, cat: 'FIXED', need: true },
  { name: 'Model + print materials', amt: 1500, cat: 'STUDIO', need: true },
  { name: 'Wine class tastings', amt: 800, cat: 'OTHER', need: false },
  { name: 'Content gear + SD cards', amt: 900, cat: 'OTHER', need: false },
  { name: 'Weekend trips / shoots', amt: 1200, cat: 'TRAVEL', need: false },
];

export const DEFAULT_LIFTS: Lift[] = [
  { name: 'Push-ups', reps: 12, last: 10, scheme: '4 sets', next: 'Feet elevated at 15' },
  { name: 'Pull-ups (park bar)', reps: 5, last: 4, scheme: '4 sets', next: 'Weighted once you hit 8' },
  { name: 'Bulgarian split squat', reps: 10, last: 8, scheme: '3 sets / leg', next: 'Hold books, then dumbbells' },
  { name: 'Pike push-ups', reps: 8, last: 6, scheme: '3 sets', next: 'Shoulder work until dumbbells' },
  { name: 'Hollow hold', reps: 35, last: 30, scheme: 'seconds × 3', next: 'Add 5s a week' },
];

export const DEFAULT_LEDGER: LedgerItem[] = [
  { label: 'Push day — 4 sets, no kit', meta: 'PUSH-UPS 12', done: false },
  { label: 'Protein to 140 g', meta: '88 / 140', done: false },
  { label: 'Post — sabadbob_', meta: 'DUE', done: false },
  { label: 'Site model — block 2 hrs', meta: 'PIN-UP FRI', done: false },
  { label: 'Read 10 pp — Contemp Theo', meta: 'WED 09:00', done: false },
  { label: 'Chinese, 19:00', meta: '19:00', done: false },
  { label: 'In bed before 02:00', meta: 'AVG 03:40', done: false },
];

export const TRAIN_WEEK = [
  { d: 'MON', label: 'push', on: true },
  { d: 'TUE', label: 'rest', on: false },
  { d: 'WED', label: 'pull', on: true },
  { d: 'THU', label: 'rest', on: false },
  { d: 'FRI', label: 'studio', on: false },
  { d: 'SAT', label: 'legs', on: true },
  { d: 'SUN', label: 'ball', on: false },
];

// Class schedule, Bangkok time — from George's profile. Day 0=Mon..6=Sun.
export const CLASS_SCHEDULE: Record<number, { name: string; start: string; end: string }[]> = {
  0: [],
  1: [{ name: 'Tech Bldg Sys 1', start: '09:00', end: '17:00' }],
  2: [{ name: 'Contemp Theo Arch', start: '09:00', end: '12:00' }, { name: 'Arch Com Ecol', start: '13:00', end: '16:00' }],
  3: [{ name: 'Wine Education', start: '13:00', end: '16:00' }],
  4: [{ name: 'Arch Design II', start: '09:00', end: '18:00' }],
  5: [],
  6: [],
};
