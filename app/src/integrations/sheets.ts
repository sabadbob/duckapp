// Reads budget numbers straight from George's actual "Income and Expenses
// Tracker" template (Transactions sheet feeds an auto-computed Monthly
// Overview sheet via SUMIFS/COUNTIFS) via the Sheets API v4 read-only REST
// endpoint (API-key auth, no OAuth needed). The sheet must be shared "anyone
// with the link can view" — see app/README.md "MONEY tab setup".
//
// Layout this reads (matches the template as-is, nothing to restructure):
//   'Monthly Overview'!C7   selected month name
//   'Monthly Overview'!C8   selected year
//   'Monthly Overview'!C10  income total for that month
//   'Monthly Overview'!C11  expense total for that month
//   'Monthly Overview'!C12  balance
//   'Monthly Overview'!E15:F40   income category | amount rows
//   'Monthly Overview'!H15:I40   expense category | amount rows

import type { SpendLine } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;

export const sheetsConfigured = Boolean(API_KEY);

export interface BudgetSheetData {
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
  incomeCats: { name: string; amt: number }[];
  expenseCats: { name: string; amt: number }[];
}

async function fetchRanges(sheetId: string, ranges: string[]): Promise<unknown[][][]> {
  const qs = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values:batchGet?${qs}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Sheets API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return (json.valueRanges ?? []).map((vr: { values?: unknown[][] }) => vr.values ?? []);
}

const num = (v: unknown) => Number(String(v ?? '0').replace(/[^0-9.\-]/g, '')) || 0;

export async function fetchBudgetSheet(sheetId: string): Promise<BudgetSheetData> {
  if (!API_KEY) throw new Error('VITE_GOOGLE_API_KEY is not set');
  const [head, incomeRows, expenseRows] = await fetchRanges(sheetId, [
    "'Monthly Overview'!C7:C12",
    "'Monthly Overview'!E15:F40",
    "'Monthly Overview'!H15:I40",
  ]);

  const monthLabel = `${head[0]?.[0] ?? ''} ${head[1]?.[0] ?? ''}`.trim();
  const income = num(head[3]?.[0]);
  const expense = num(head[4]?.[0]);
  const balance = num(head[5]?.[0]);

  const incomeCats = incomeRows
    .filter(r => r[0] && num(r[1]) !== 0)
    .map(r => ({ name: String(r[0]), amt: num(r[1]) }));
  const expenseCats = expenseRows
    .filter(r => r[0] && num(r[1]) !== 0)
    .map(r => ({ name: String(r[0]), amt: num(r[1]) }));

  return { monthLabel, income, expense, balance, incomeCats, expenseCats };
}

// George's tracker has no built-in "necessary vs want" flag on categories —
// this is a starting guess the MONEY tab lets him override per-category
// (persisted locally, not written back into the sheet).
export const DEFAULT_WANT_CATEGORIES = new Set([
  'Food', 'FoodWOthers', 'Shopping', 'Pay friends', 'To TrueMoney',
]);

export function expenseCatsToSpendLines(cats: { name: string; amt: number }[], wantOverrides: Record<string, boolean>): SpendLine[] {
  return cats.map(c => ({
    name: c.name,
    amt: c.amt,
    cat: c.name,
    need: !(wantOverrides[c.name] ?? DEFAULT_WANT_CATEGORIES.has(c.name)),
  }));
}
