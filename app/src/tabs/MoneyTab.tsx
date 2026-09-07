import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { TabScroll } from '../components/Shell';
import { fetchBudgetSheet, sheetsConfigured, expenseCatsToSpendLines, type BudgetSheetData } from '../integrations/sheets';
import { bangkokTimeLabel } from '../lib/time';

const SLICE_COLORS = ['#fa8317', '#8f8b85', '#4d545e', '#6f6b66', '#cbc7c1', '#9a4d00'];

export function MoneyTab() {
  const s = useApp();
  const [sheetIdInput, setSheetIdInput] = useState(s.sheetId ?? '');
  const [data, setData] = useState<BudgetSheetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doSync(id: string) {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const d = await fetchBudgetSheet(id);
      setData(d);
      s.setSheetId(id);
      s.markSheetSynced();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (s.sheetId && sheetsConfigured) void doSync(s.sheetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const income = data?.income ?? 0;
  const expense = data?.expense ?? 0;
  const balance = data?.balance ?? income - expense;
  const expenseCats = data?.expenseCats ?? [];
  const savings = expenseCats.find(c => c.name === 'Savings Account');

  const denom = income || expense || 1;
  const splits = expenseCats
    .filter(c => c.name !== 'Savings Account')
    .map((c, i) => ({ ...c, pct: (c.amt / denom) * 100, color: SLICE_COLORS[i % SLICE_COLORS.length] }));

  const spendLines = expenseCatsToSpendLines(expenseCats.filter(c => c.name !== 'Savings Account'), s.wantOverrides);
  const need = spendLines.filter(e => e.need).reduce((a, e) => a + e.amt, 0);
  const want = spendLines.filter(e => !e.need).reduce((a, e) => a + e.amt, 0);
  const filtered = spendLines.filter(e => s.filt === 0 || (s.filt === 1 ? e.need : !e.need));

  return (
    <TabScroll>
      <div style={{ background: 'var(--ink)', padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="lbl" style={{ color: 'var(--grey)', whiteSpace: 'nowrap' }}>{data ? data.monthLabel.toUpperCase() : 'MONTHLY'} · INCOME</div>
            <div style={{ font: "400 34px/0.95 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 9, fontVariantNumeric: 'tabular-nums' }}>฿{income.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="lbl" style={{ color: 'var(--grey)', whiteSpace: 'nowrap' }}>BALANCE</div>
            <div style={{ font: "400 22px/1 'Source Serif 4',serif", color: 'var(--orange)', marginTop: 9, fontVariantNumeric: 'tabular-nums' }}>฿{balance.toLocaleString()}</div>
          </div>
        </div>
        {splits.length > 0 && (
          <>
            <div style={{ display: 'flex', height: 12, marginTop: 16 }}>
              {splits.map(sp => <div key={sp.name} style={{ width: `${sp.pct}%`, background: sp.color }} />)}
            </div>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 9, font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--grey)', whiteSpace: 'nowrap' }}>
              {splits.map(sp => <span key={sp.name} style={{ color: sp.color === '#cbc7c1' ? '#cbc7c1' : sp.color }}>{sp.name.toUpperCase()} {sp.pct.toFixed(0)}%</span>)}
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTop: '1px solid #4d545e', paddingTop: 11 }}>
          <span style={{ font: "600 8.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--grey)' }}>
            {data ? `SYNCED ${bangkokTimeLabel()}` : sheetsConfigured ? 'NOT CONNECTED' : 'GOOGLE SHEETS API KEY NOT SET'}
          </span>
          <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, borderColor: '#f0ece6', color: '#f0ece6' }}
            onClick={() => doSync(sheetIdInput || s.sheetId || '')} disabled={loading || !(sheetIdInput || s.sheetId)}>
            {loading ? 'SYNCING…' : 'RE-SYNC'}
          </button>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input value={sheetIdInput} onChange={e => setSheetIdInput(e.target.value)} placeholder="paste your tracker's Sheet ID"
            style={{ flex: 1, minWidth: 0, font: "500 10px/1 'Archivo'", padding: '9px 8px', background: 'transparent', border: '1px solid #4d545e', color: '#f0ece6' }} />
          <button className="btn2 btn2o" style={{ width: 'auto', padding: '7px 9px', fontSize: 9 }} onClick={() => doSync(sheetIdInput)}>CONNECT</button>
        </div>
        {error && <div style={{ font: "400 12px/1.4 'Source Serif 4',serif", color: '#fa8317', marginTop: 8 }}>{error}</div>}
        {!data && !error && (
          <div style={{ font: "400 12px/1.4 'Source Serif 4',serif", color: 'var(--panel)', marginTop: 8 }}>
            Connect your Income and Expenses Tracker sheet above to pull real numbers — see MONEY setup in app/README.md.
          </div>
        )}
      </div>

      {savings && (
        <div style={{ padding: '13px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">SAVINGS ACCOUNT</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>THIS MONTH</span>
        </div>
      )}
      {savings && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ background: 'var(--panel)', padding: '11px 10px', marginTop: 9 }}>
            <div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)' }}>MOVED TO SAVINGS</div>
            <div style={{ font: "400 20px/1 'Source Serif 4',serif", marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>฿{savings.amt.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)' }}>
        {['ALL', 'NEEDED', 'WANTS'].map((label, i) => (
          <button key={label} className="tab" style={{ background: s.filt === i ? '#232323' : 'transparent', color: s.filt === i ? '#f0ece6' : '#4d545e', fontSize: 9, padding: '12px 0' }}
            onClick={() => s.setFilt(i)}>{label}</button>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 && (
          <div style={{ font: "400 13px/1.4 'Source Serif 4',serif", color: 'var(--slate)', padding: '14px 0' }}>Nothing here yet — connect your sheet above.</div>
        )}
        {filtered.map(e => {
          const isWant = !e.need;
          const overridden = s.wantOverrides[e.cat] !== undefined;
          return (
            <div key={e.cat} style={{ padding: '11px 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: e.need ? '#232323' : '#9a4d00', whiteSpace: 'nowrap', minWidth: 52 }}>{e.need ? 'NEED' : 'WANT'}</span>
              <span style={{ font: "400 15px/1.2 'Source Serif 4',serif", flex: 1, minWidth: 0 }}>{e.name}</span>
              <span style={{ font: "400 15px/1.2 'Source Serif 4',serif", color: 'var(--slate)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>฿{e.amt.toLocaleString()}</span>
              <button
                className="btn2" style={{ width: 'auto', padding: '5px 6px', fontSize: 8, opacity: overridden ? 1 : 0.5 }}
                title="Flip whether this category counts as a need or a want"
                onClick={() => s.toggleWant(e.cat, isWant)}
              >
                ⇄
              </button>
            </div>
          );
        })}
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', margin: '12px 0 18px' }}>
          {s.filt === 2
            ? `฿${want.toLocaleString()} of wants. That is the number to cut when a month goes sideways — nothing above it.`
            : s.filt === 1
              ? `฿${need.toLocaleString()} committed before you choose anything.`
              : `Necessary ฿${need.toLocaleString()} · wants ฿${want.toLocaleString()}. Tap ⇄ on a line if I guessed its category wrong.`}
        </div>
      </div>
    </TabScroll>
  );
}
