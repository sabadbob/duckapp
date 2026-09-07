import { useApp } from '../store';
import { TabScroll } from '../components/Shell';
import { TRAIN_WEEK } from '../data';
import { bangkokDayIndex, isSameBangkokDate } from '../lib/time';

export function BodyTab() {
  const s = useApp();
  const todayIdx = bangkokDayIndex();
  const today = TRAIN_WEEK[todayIdx];
  const todaysOrders = s.orders.filter(o => isSameBangkokDate(o.ts));

  const protein = s.proteinBase + todaysOrders.reduce((a, o) => a + Math.round(o.kcal * 0.055), 0);
  const kcal = s.kcalBase + todaysOrders.reduce((a, o) => a + o.kcal, 0);
  const proteinW = Math.min(100, (protein / 140) * 100);
  const kcalW = Math.min(100, (kcal / 2700) * 100);
  const macroNote = kcal < 2200
    ? `Under by ${2700 - kcal}. A bulk on paper only is just a diet with extra steps.`
    : kcal < 2700
      ? `${2700 - kcal} to go. One more real meal, not a snack.`
      : 'Surplus hit. Protein is the only number left that matters.';

  return (
    <TabScroll>
      <div style={{ background: 'var(--ink)', padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div><div className="lbl" style={{ color: 'var(--grey)' }}>LEAN BULK</div>
            <div style={{ font: "400 30px/1 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 9 }}>60.4 <span style={{ fontSize: 15, color: 'var(--grey)' }}>kg</span></div></div>
          <div style={{ textAlign: 'right' }}><div className="lbl" style={{ color: 'var(--grey)' }}>FROM 58.0</div>
            <div style={{ font: "400 18px/1 'Source Serif 4',serif", color: 'var(--orange)', marginTop: 9 }}>+2.4 kg</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: "600 8.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--grey)' }}><span>PROTEIN</span><span>{protein} / 140 G</span></div>
            <div style={{ height: 8, background: '#5c7185', marginTop: 7 }}><div style={{ height: '100%', width: `${proteinW}%`, background: 'var(--orange)', transition: 'width .4s' }} /></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: "600 8.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--grey)' }}><span>CALORIES</span><span>{kcal} / 2700</span></div>
            <div style={{ height: 8, background: '#5c7185', marginTop: 7 }}><div style={{ height: '100%', width: `${kcalW}%`, background: 'var(--cream)', transition: 'width .4s' }} /></div>
          </div>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--panel)', marginTop: 13 }}>{macroNote}</div>
      </div>

      <div style={{ padding: '13px 16px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">TRAIN / REST · MY CALL</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>{TRAIN_WEEK.filter(d => d.on).length} ON · {TRAIN_WEEK.filter(d => !d.on).length} OFF</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginTop: 11 }}>
          {TRAIN_WEEK.map((d, i) => (
            <div key={d.d} style={{ background: i === todayIdx ? '#2f3a44' : '#cfe2ee', padding: '8px 4px' }}>
              <div style={{ font: "700 8px/1 'Archivo'", color: i === todayIdx ? '#ffffff' : '#5c7185' }}>{d.d}</div>
              <div style={{ font: "400 10px/1.2 'Source Serif 4',serif", color: i === todayIdx ? '#cfe2ee' : '#5c7185', marginTop: 5 }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 12 }}>Friday is nine hours of studio — training that day never survives, so it's a rest day by design, not by failure. Sunday basketball counts as the fourth.</div>
      </div>

      <div style={{ padding: '13px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="lbl">BODYWEIGHT · {today.on ? today.label.toUpperCase() + ' DAY' : "TODAY'S A REST DAY"}</span>
        <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>NO GYM · NO KIT</span>
      </div>
      <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ font: "400 13px/1.3 'Source Serif 4',serif", color: 'var(--slate)' }}>Every rep you add feeds the duck — +1 point per rep, taken back if you undo it.</span>
        <span style={{ font: "400 20px/1 'Source Serif 4',serif", fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 10 }}>{s.repPoints}</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        {s.lifts.map((l, i) => {
          const delta = l.reps > l.last ? `+${l.reps - l.last}` : 'HOLDING';
          return (
            <div key={l.name} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: "400 16px/1.2 'Source Serif 4',serif" }}>{l.name}</span>
                <span style={{ font: "600 9px/1 'Archivo'", letterSpacing: '.1em', color: l.reps > l.last ? '#a8455e' : '#5c7185' }}>{delta}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 9 }}>
                <div style={{ font: "400 21px/1 'Source Serif 4',serif", fontVariantNumeric: 'tabular-nums', minWidth: 52 }}>{l.reps}</div>
                <div style={{ font: "600 9px/1.4 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)', flex: 1, minWidth: 0 }}>{l.scheme} · LAST {l.last}</div>
                <button className="btn2" style={{ width: 'auto', padding: '7px 10px', fontSize: 9 }} onClick={() => s.adjustLift(i, -1)}>−1</button>
                <button className="btn2 btn2o" style={{ width: 'auto', padding: '7px 10px', fontSize: 9 }} onClick={() => s.adjustLift(i, 1)}>+1</button>
              </div>
              <div style={{ font: "400 13px/1.35 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 7 }}>{l.next}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '13px 16px 16px' }}>
        <button className="btn2 btn2o" onClick={() => s.logSession()}>Log session — tick the ledger</button>
      </div>

      <div style={{ borderTop: '2px solid var(--ink)', background: 'var(--panel)', padding: '13px 16px 18px' }}>
        <div className="lbl">MEASUREMENTS · 178 CM</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, marginTop: 11 }}>
          {[['CHEST', 86], ['WAIST', 73], ['HIP', 92], ['BACK', 48]].map(([label, val]) => (
            <div key={label as string} style={{ background: 'var(--phone)', padding: '10px 8px' }}>
              <div style={{ font: "600 8px/1 'Archivo'", letterSpacing: '.1em', color: 'var(--slate)' }}>{label}</div>
              <div style={{ font: "400 19px/1 'Source Serif 4',serif", marginTop: 7 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 12 }}>Basketball Sunday, volleyball Wednesday. Both count as cardio, neither counts as a session.</div>
      </div>
    </TabScroll>
  );
}
