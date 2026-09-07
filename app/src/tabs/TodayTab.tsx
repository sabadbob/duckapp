import { useState } from 'react';
import { useApp } from '../store';
import { TabScroll } from '../components/Shell';
import { DuckMark } from '../components/DuckStageArt';
import { ImageUpload } from '../components/ImageUpload';
import { bangkokDateIso, bangkokTimeLabel } from '../lib/time';

export function TodayTab() {
  const s = useApp();
  const doneCount = s.ledger.filter(i => i.done).length;
  const postponedCount = s.ledger.filter(i => i.postponed && !i.done).length;
  const total = s.ledger.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const activeIdx = s.ledger.findIndex(i => !i.done && !i.postponed);
  const current = activeIdx >= 0 ? s.ledger[activeIdx] : null;

  const prompt = current
    ? `"${current.label}"${current.meta && current.meta !== 'DUE' ? ` — ${current.meta}` : ''}. Doing it, or telling me now?`
    : postponedCount > 0
      ? `Everything else is handled. ${postponedCount} pushed to tomorrow — that's the only reason this isn't 100%.`
      : 'Everything ticked. I have nothing to hold over you. Go to sleep.';
  const pctNote = doneCount === 0
    ? 'Nothing ticked. Bold way to start the day.'
    : doneCount === total
      ? 'All of it. Suspicious, but I will allow it.'
      : doneCount >= total - 2
        ? 'Close. The last two are the ones you always leave.'
        : `${total - doneCount} left, and the studio one is not optional.`;

  const todayFrames = s.frames.filter(f => bangkokDateIso(new Date(f.ts)) === bangkokDateIso());
  const [planDraft, setPlanDraft] = useState('');

  return (
    <TabScroll>
      <div style={{ padding: '15px 16px 17px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="lbl">DAY PROGRESS</div>
            <div style={{ font: "400 40px/0.9 'Source Serif 4',serif", marginTop: 9, fontVariantNumeric: 'tabular-nums' }}>
              {pct}<span style={{ fontSize: 19 }}>%</span>
            </div>
          </div>
          <div style={{ font: "400 14px/1.35 'Source Serif 4',serif", color: 'var(--slate)', textAlign: 'right', maxWidth: 190 }}>{pctNote}</div>
        </div>
        <div style={{ position: 'relative', marginTop: 26 }}>
          <div style={{ position: 'absolute', top: -25, left: `calc(${pct}% - 10px)`, transition: 'left .4s cubic-bezier(.3,.8,.3,1)' }}>
            <DuckMark size={21} />
          </div>
          <div style={{ height: 10, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4d545e 0%,#8f6a52 55%,#fa8317 100%)', transition: 'width .4s cubic-bezier(.3,.8,.3,1)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginTop: 6, font: "600 8.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>
            <span>WAKE</span><span style={{ textAlign: 'center' }}>MIDDAY</span><span style={{ textAlign: 'right' }}>02:00 CUTOFF</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px', borderBottom: '2px solid var(--ink)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <DuckMark size={28} />
          <div style={{ font: "400 17px/1.4 'Source Serif 4',serif", flex: 1 }}>{prompt}</div>
        </div>
        {current && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingLeft: 39 }}>
            <button className="btn2 btn2o" style={{ padding: '11px 12px' }} onClick={() => s.didIt(activeIdx)}>Did it</button>
            <button className="btn2" style={{ padding: '11px 12px' }} onClick={() => s.cantDo(activeIdx)}>Can't today</button>
          </div>
        )}
        {s.log.map((r, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ font: "600 13px/1.4 'Archivo'", textAlign: 'right' }}>{r.you}</div>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <DuckMark size={28} />
              <div style={{ font: "400 16px/1.45 'Source Serif 4',serif", color: '#3a3a38', flex: 1 }}>{r.duck}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="lbl">TODAY'S LEDGER</span>
        <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>{doneCount} / {total} DONE</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        {s.ledger.map((it, i) => {
          const isPostponed = it.postponed && !it.done;
          return (
            <button key={i} className="row" onClick={() => s.toggleLedgerItem(i)}>
              <div style={{ width: 19, height: 19, flex: 'none', border: '2px solid var(--ink)', background: it.done ? '#232323' : 'transparent', display: 'grid', placeItems: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f0ece6" strokeWidth="3.4" strokeLinecap="square" style={{ opacity: it.done ? 1 : 0 }}>
                  <path d="M4 12.5 L9.5 18 L20 6.5" />
                </svg>
              </div>
              <div style={{ flex: 1, font: "400 15px/1.25 'Source Serif 4',serif", color: it.done ? '#8f8b85' : isPostponed ? '#9a4d00' : '#232323', textDecoration: it.done ? 'line-through' : 'none' }}>{it.label}</div>
              <div style={{ font: "600 9.5px/1.5 'Archivo'", letterSpacing: '.1em', color: it.done ? '#7d7a74' : isPostponed ? '#9a4d00' : (it.meta === 'DUE' || it.meta.includes('PIN-UP') ? '#9a4d00' : '#4d545e'), fontVariantNumeric: 'tabular-nums' }}>
                {isPostponed ? '→ TMR' : it.meta}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12, borderTop: '2px solid var(--ink)', padding: '13px 16px 16px' }}>
        <div className="lbl">PLAN TOMORROW</div>
        <div style={{ font: "400 13.5px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 8 }}>
          Say what you want done tomorrow — it becomes tomorrow's ledger at rollover, on top of anything pushed forward from today.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <input
            value={planDraft} onChange={e => setPlanDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && planDraft.trim()) { s.addPlanItem(planDraft); setPlanDraft(''); } }}
            placeholder="e.g. Finish site model sections"
            style={{ flex: 1, minWidth: 0, font: "400 14px/1 'Source Serif 4'", padding: '10px 10px', border: '2px solid #232323', background: 'transparent' }}
          />
          <button className="btn2 btn2o" style={{ width: 'auto', padding: '10px 12px', fontSize: 10 }}
            onClick={() => { if (planDraft.trim()) { s.addPlanItem(planDraft); setPlanDraft(''); } }}>ADD</button>
        </div>
        {s.tomorrowPlan.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {s.tomorrowPlan.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ font: "400 14px/1.2 'Source Serif 4',serif" }}>{p.label}</span>
                <button className="btn2" style={{ width: 'auto', padding: '4px 7px', fontSize: 8 }} onClick={() => s.removePlanItem(i)}>REMOVE</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: '2px solid var(--ink)', background: 'var(--panel)', padding: '13px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">TODAY'S FRAMES</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>DROP A PHOTO</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginTop: 11 }}>
          {todayFrames.map(f => (
            <div key={f.id}>
              <div style={{ aspectRatio: '1', background: '#f0ece6', filter: 'grayscale(1)' }}>
                <ImageUpload id={`frame-${f.id}`} value={f.url} placeholder="" onChange={() => {}} />
              </div>
              <div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', marginTop: 4 }}>{bangkokTimeLabel(new Date(f.ts))}</div>
            </div>
          ))}
          <div>
            <div style={{ aspectRatio: '1', background: '#f0ece6', filter: 'grayscale(1)' }}>
              <ImageUpload id="frame-new" value={null} placeholder="add now" onChange={url => s.addFrame(url)} />
            </div>
            <div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', marginTop: 4 }}>ADD NOW</div>
          </div>
        </div>
      </div>
    </TabScroll>
  );
}
