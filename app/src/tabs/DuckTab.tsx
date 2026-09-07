import { useMemo, useState } from 'react';
import { useApp, computePoints } from '../store';
import { TabScroll } from '../components/Shell';
import { DuckStageArt, FlockDuckMark } from '../components/DuckStageArt';
import { SNACKS } from '../data';
import { STAGE_NAMES, STAGE_NOTES, STAGE_RANGES, STAGE_SHORT, stageIndex, flockDuckGeometry } from '../lib/duck';
import { useFlockMembers, generateFlockCode } from '../lib/flock';
import { midnightCountdownLabel, bangkokDayIndex } from '../lib/time';

const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function DuckTab() {
  const s = useApp();
  const si = stageIndex(s.streak);
  const points = computePoints(s);
  const flockRows = useFlockMembers(s.flockCode);
  const [codeInput, setCodeInput] = useState('');

  const ledgerDone = s.ledger.filter(i => i.done).length;
  const closedDays = s.week.filter(v => v === 1).length;

  const flock = useMemo(() => {
    const mine = { uid: 'me', name: s.displayName, streak: s.streak, best: Math.max(s.best, s.streak) };
    const others = flockRows.filter(m => m.uid !== s.uid).map(m => ({ uid: m.uid, name: m.name, streak: m.streak, best: m.best }));
    return [mine, ...others].sort((a, b) => b.streak - a.streak);
  }, [flockRows, s]);

  const top = flock.find(f => f.uid !== 'me');

  return (
    <TabScroll>
      <div style={{ background: 'var(--ink)', padding: '15px 16px 13px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="lbl" style={{ color: 'var(--grey)' }}>CURRENT STREAK</div>
          <div style={{ font: "400 72px/0.82 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>{s.streak}</div>
          <div className="lbl" style={{ color: 'var(--orange)', marginTop: 8 }}>{s.streak === 1 ? 'DAY CLOSED' : 'DAYS CLOSED'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="lbl" style={{ color: 'var(--grey)' }}>BEST</div>
          <div style={{ font: "400 26px/1 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{Math.max(s.best, s.streak)}</div>
        </div>
      </div>

      <div style={{ padding: 0, background: 'var(--panel)', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ padding: '14px 16px 0' }}>
          <div className="lbl">{STAGE_NAMES[si]}</div>
          <div style={{ font: "400 15px/1.3 'Source Serif 4',serif", marginTop: 6, maxWidth: 250 }}>{STAGE_NOTES[si]}</div>
        </div>
        <div style={{ height: 262, display: 'grid', placeItems: 'end center', position: 'relative', overflow: 'hidden' }}>
          <DuckStageArt stage={si as 0 | 1 | 2 | 3 | 4} />
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div className="lbl">GROWTH</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 2, marginTop: 11 }}>
          {[0, 1, 2, 3, 4].map(i => {
            const bg = i === si ? '#232323' : i < si ? '#8f8b85' : '#cbc7c1';
            const ink = i === si ? '#f0ece6' : i < si ? '#f0ece6' : '#4d545e';
            return (
              <div key={i} style={{ background: bg, padding: '8px 5px 9px', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ font: "700 8px/1 'Archivo'", letterSpacing: '.06em', color: ink }}>{STAGE_RANGES[i]}</div>
                <div style={{ font: "600 8.5px/1.2 'Archivo',sans-serif", letterSpacing: '.06em', color: ink, marginTop: 7 }}>{STAGE_SHORT[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">THIS WEEK</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>{closedDays} / 7 CLOSED</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginTop: 11 }}>
          {s.week.map((v, i) => {
            const bg = v === 1 ? '#232323' : v === 0 ? '#fa8317' : '#cbc7c1';
            const ink = v === 1 ? '#f0ece6' : v === 0 ? '#232323' : '#4d545e';
            return (
              <div key={i} style={{ background: bg, aspectRatio: '1', display: 'grid', placeItems: 'center', font: "700 10px/1 'Archivo'", color: ink }}>
                {WEEK_LETTERS[i]}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">THE FLOCK</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>
            {s.flockCode ? `${flock.length} IN FLOCK` : 'NO FLOCK YET'}
          </span>
        </div>

        {!s.flockCode && (
          <div style={{ marginTop: 11, display: 'flex', gap: 6 }}>
            <input
              value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())}
              placeholder="ENTER CODE" maxLength={6}
              style={{ flex: 1, font: "600 11px/1 'Archivo'", letterSpacing: '.08em', border: '2px solid #232323', padding: '10px 8px', background: 'transparent', minWidth: 0 }}
            />
            <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9 }}
              onClick={() => codeInput && s.setFlockCode(codeInput)}>JOIN</button>
            <button className="btn2 btn2o" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap' }}
              onClick={() => s.setFlockCode(generateFlockCode())}>NEW</button>
          </div>
        )}

        {s.flockCode && (
          <>
            <div style={{ font: "600 9px/1.4 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', marginTop: 10 }}>
              CODE {s.flockCode} — share it so friends can join
            </div>
            {flock.map(f => {
              const geo = flockDuckGeometry(f.streak);
              const fsi = stageIndex(f.streak);
              const mine = f.uid === 'me';
              return (
                <div key={f.uid} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', background: mine ? 'var(--panel)' : 'transparent' }}>
                  <div style={{ width: 44, height: 38, flex: 'none', display: 'grid', placeItems: 'end center' }}>
                    <FlockDuckMark geo={geo} fill={mine ? '#232323' : '#8f8b85'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "400 15.5px/1.2 'Source Serif 4',serif" }}>{mine ? 'You' : f.name}</div>
                    <div style={{ font: "600 8.5px/1.4 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', marginTop: 4 }}>{STAGE_SHORT[fsi]} · BEST {f.best}</div>
                  </div>
                  <div style={{ font: "400 21px/1 'Source Serif 4',serif", fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{f.streak}</div>
                  <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap' }}
                    onClick={() => mine ? navigator.clipboard?.writeText(s.flockCode ?? '') : s.poke(f.uid, f.name)}>
                    {mine ? 'SHARE' : (s.poked.includes(f.uid) ? 'POKED' : 'POKE')}
                  </button>
                </div>
              );
            })}
            <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 11 }}>
              {top
                ? s.streak > top.streak ? `You are ahead of ${top.name} by ${s.streak - top.streak}. Say nothing, just keep going.`
                : s.streak === top.streak ? `Dead level with ${top.name}. Whoever blinks first loses their duck.`
                : `${top.name} is ${top.streak - s.streak} ahead and their duck is visibly smugger.`
                : 'Invite someone in and this turns into a real leaderboard.'}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="lbl" style={{ whiteSpace: 'nowrap' }}>DUCK POINTS</div>
            <div style={{ font: "400 34px/0.95 'Source Serif 4',serif", marginTop: 9, fontVariantNumeric: 'tabular-nums' }}>{points}</div>
          </div>
          <div style={{ textAlign: 'right', flex: 'none', font: "600 8.5px/1.6 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>
            +10 PER TASK<br />+15 PER DAY CLOSED
          </div>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 11 }}>
          {points < 20 ? 'Tick work to earn. Snacks are the only thing points are good for, which is the point.' : 'Enough for a snack. He has been staring at you for an hour.'}
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">SNACK SHOP</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>{s.fed.length} FED</span>
        </div>
        {SNACKS.map(k => {
          const owned = s.fed.includes(k.id);
          const can = points >= k.cost;
          return (
            <div key={k.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--line)', opacity: owned || can ? 1 : 0.45 }}>
              <div style={{ width: 34, height: 34, flex: 'none', background: owned ? '#fa8317' : '#cbc7c1', display: 'grid', placeItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#232323" strokeWidth="1.9" strokeLinecap="square"><path d={k.d} /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "400 15.5px/1.2 'Source Serif 4',serif" }}>{k.name}</div>
                <div style={{ font: "600 8.5px/1.4 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', marginTop: 4 }}>{k.effect}</div>
              </div>
              <div style={{ font: "400 17px/1 'Source Serif 4',serif", fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{k.cost}</div>
              <button
                className="btn2" disabled={owned || !can}
                style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap', borderColor: owned ? '#fa8317' : '#232323', background: owned ? '#fa8317' : 'transparent' }}
                onClick={() => s.buySnack(k.id)}
              >
                {owned ? 'FED' : 'FEED'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button className="btn2 btn2o" disabled={s.week[bangkokDayIndex()] !== -1} onClick={() => s.closeDay()}>
          Close the day — feed the duck +15
        </button>
        <div style={{ border: '2px solid var(--ink)', padding: '11px 12px' }}>
          <div className="lbl" style={{ color: 'var(--orange-ink)' }}>MIDNIGHT RULE · {midnightCountdownLabel()}</div>
          <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", marginTop: 8 }}>
            P1 work unfinished at 00:00 ends the streak on its own. It isn't a button you press — it's a deadline you either beat or you don't. Flag a slip in WORK before midnight and the duck keeps half his fat.
          </div>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)' }}>
          {s.streak >= s.best ? 'You are at your own record. Nothing to say, just do not stop.' : `${s.best - s.streak} days off your best. He remembers being bigger.`}
        </div>
        <div style={{ font: "400 12px/1.4 'Source Serif 4',serif", color: 'var(--grey)' }}>{ledgerDone}/{s.ledger.length} on today's ledger so far.</div>
      </div>
    </TabScroll>
  );
}
