import { useState } from 'react';
import { useApp } from '../store';
import { TabScroll } from '../components/Shell';
import { ImageUpload } from '../components/ImageUpload';
import { DEFAULT_WORK, CLASS_SCHEDULE } from '../data';
import { daysUntilNextFriday, midnightCountdownLabel } from '../lib/time';

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const shortHour = (t: string) => String(Number(t.slice(0, 2)));

function dayLabel(i: number) {
  const items = CLASS_SCHEDULE[i];
  if (!items.length) return 'free';
  return items.map(c => `${shortHour(c.start)}–${shortHour(c.end)}`).join(' / ');
}

export function WorkTab() {
  const s = useApp();
  const daysOut = daysUntilNextFriday();
  const p1Indices = DEFAULT_WORK.reduce<number[]>((acc, w, i) => (w.p === 'P1' ? [...acc, i] : acc), []);
  const allP1Resolved = p1Indices.every(i => s.workDone.includes(i) || s.slipped.includes(i));

  const riskTag = s.slipped.length ? 'SLIP FLAGGED · HALF FAT KEPT' : allP1Resolved ? 'P1 CLEAR' : 'STREAK AT RISK';
  const riskColor = allP1Resolved && !s.slipped.length ? '#232323' : '#fa8317';
  const riskLine = s.slipped.length
    ? 'Flagged before midnight, so the streak survives at half — the duck slims but does not reset. Do not make it a habit.'
    : allP1Resolved
      ? 'P1 is done. Midnight has nothing to take from you tonight.'
      : 'The pin-up model is P1 and unfinished. At 00:00 the streak ends by itself unless you mark it done or flag the slip.';

  const [captionDraft, setCaptionDraft] = useState('');

  return (
    <TabScroll>
      <div style={{ background: 'var(--ink)', padding: '14px 16px 16px' }}>
        <div className="lbl" style={{ color: 'var(--grey)' }}>NEXT PIN-UP · {daysOut === 0 ? 'TODAY' : `${daysOut} DAY${daysOut === 1 ? '' : 'S'}`}</div>
        <div style={{ font: "400 27px/1.05 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 9 }}>
          Arch Design II<br />site model + 2 sections
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, marginTop: 15 }}>
          {DAY_NAMES.map((d, i) => (
            <div key={d} style={{ background: i === 4 ? '#fa8317' : '#4d545e', padding: '8px 6px' }}>
              <div style={{ font: "700 8px/1 'Archivo'", color: i === 4 ? '#232323' : '#f0ece6' }}>{d}</div>
              <div style={{ font: "400 11px/1.2 'Source Serif 4',serif", color: i === 4 ? '#232323' : '#cbc7c1', marginTop: 5 }}>
                {i === 4 ? 'pin-up' : dayLabel(i)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '13px 16px 0' }}>
        <div style={{ border: `2px solid ${riskColor}`, background: riskColor === '#fa8317' ? '#fa8317' : 'transparent', padding: '11px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.14em', color: '#232323', whiteSpace: 'nowrap' }}>{riskTag}</span>
            <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: '#232323', whiteSpace: 'nowrap' }}>{midnightCountdownLabel()}</span>
          </div>
          <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: '#232323', marginTop: 8 }}>{riskLine}</div>
        </div>
      </div>

      <div style={{ padding: '13px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="lbl">DELIVERABLES · BY PRIORITY</span>
        <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>THIS WEEK</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        {DEFAULT_WORK.map((w, i) => {
          const done = s.workDone.includes(i);
          const slipped = s.slipped.includes(i);
          const pBg = w.p === 'P1' ? '#fa8317' : w.p === 'P2' ? '#4d545e' : '#8f8b85';
          const pInk = w.p === 'P1' ? '#232323' : '#f0ece6';
          return (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{ font: "700 9px/1.3 'Archivo'", letterSpacing: '.1em', color: pInk, background: pBg, padding: '4px 5px', whiteSpace: 'nowrap' }}>{w.p}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ font: "400 15.5px/1.2 'Source Serif 4',serif" }}>{w.name}</span>
                  <span style={{ font: "600 9px/1.3 'Archivo'", letterSpacing: '.1em', color: w.p === 'P1' ? '#9a4d00' : '#4d545e', whiteSpace: 'nowrap' }}>{w.due}</span>
                </div>
                <div style={{ font: "400 13.5px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 5 }}>{w.needs}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                  <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap', borderColor: done ? '#fa8317' : '#232323', background: done ? '#fa8317' : 'transparent' }}
                    onClick={() => s.markWorkDone(i)}>{done ? 'DONE +10' : 'MARK DONE'}</button>
                  <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap', borderColor: slipped ? '#9a4d00' : '#8f8b85', color: slipped ? '#9a4d00' : '#4d545e' }}
                    onClick={() => s.flagSlip(i)}>{slipped ? 'SLIP FLAGGED' : "CAN'T FINISH"}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '14px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="lbl">TASTE FEED</span>
        <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>{s.taste.filter(t => t.kept).length} KEPT</span>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 4 }}>
          {s.taste.map((t, i) => (
            <div key={t.id} style={{ minWidth: 0 }}>
              <div style={{ height: i % 3 === 0 ? 150 : 112, background: '#f0ece6', filter: 'grayscale(1)' }}>
                <ImageUpload id={`taste-${t.id}`} value={t.imageUrl} placeholder={t.caption || 'reference'} onChange={() => {}} />
              </div>
              <button
                className="btn2" style={{ padding: '7px 8px', fontSize: 9, marginTop: 4, borderColor: t.kept ? '#fa8317' : '#232323', background: t.kept ? '#fa8317' : 'transparent' }}
                onClick={() => s.keepTaste(t.id)}
              >
                {t.kept ? 'KEPT' : 'KEEP'}
              </button>
            </div>
          ))}
          <div style={{ minWidth: 0 }}>
            <div style={{ height: 112, background: '#f0ece6', filter: 'grayscale(1)' }}>
              <ImageUpload
                id="taste-new" value={null} placeholder="add a reference"
                onChange={url => { s.addTaste({ imageUrl: url, caption: captionDraft, kept: false }); setCaptionDraft(''); }}
              />
            </div>
            <input
              value={captionDraft} onChange={e => setCaptionDraft(e.target.value)} placeholder="caption (optional)"
              style={{ width: '100%', marginTop: 4, font: "400 10px/1 'Source Serif 4'", border: '1px solid var(--line)', padding: '6px 6px' }}
            />
          </div>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 12 }}>
          {s.taste.length === 0
            ? 'Keep a few and the feed leans that way — material, joinery, tailoring, whatever you keep picking.'
            : `${s.taste.filter(t => t.kept).length} kept out of ${s.taste.length}. Pinterest-style, mixed media, yours.`}
        </div>
      </div>

      <div style={{ borderTop: '2px solid var(--ink)', background: 'var(--panel)', padding: '13px 16px 18px' }}>
        <div className="lbl">NUS TRACK</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginTop: 11 }}>
          <div style={{ background: 'var(--phone)', padding: '10px 8px' }}><div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)' }}>GPA</div><div style={{ font: "400 19px/1 'Source Serif 4',serif", marginTop: 7 }}>3.0 →</div></div>
          <div style={{ background: 'var(--phone)', padding: '10px 8px' }}><div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)' }}>TARGET</div><div style={{ font: "400 19px/1 'Source Serif 4',serif", marginTop: 7 }}>3.5</div></div>
          <div style={{ background: 'var(--phone)', padding: '10px 8px' }}><div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)' }}>IELTS</div><div style={{ font: "400 19px/1 'Source Serif 4',serif", marginTop: 7 }}>7 → 8</div></div>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 12 }}>Apply in 18 months. Every semester from here is the narrative.</div>
      </div>
    </TabScroll>
  );
}
