import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { TabScroll } from '../components/Shell';
import { ImageUpload } from '../components/ImageUpload';
import { SEED_PLACES } from '../data';
import { searchNearbyRestaurants, getUserLocation, placesConfigured } from '../integrations/places';
import { isSameBangkokDate, isSameBangkokWeek } from '../lib/time';
import type { Place } from '../types';

const WEEKLY_FOOD_BUDGET = 1400;

export function FoodTab() {
  const s = useApp();
  const [places, setPlaces] = useState<Place[]>(SEED_PLACES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!placesConfigured) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const loc = await getUserLocation();
        const results = await searchNearbyRestaurants(loc);
        if (!cancelled && results.length) { setPlaces(results); setLive(true); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load nearby restaurants');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sorted = [...places].sort((a, b) => (s.sort === 0 ? a.eta - b.eta : s.sort === 1 ? b.rating - a.rating : a.baht - b.baht));

  const weekBaht = s.orders.filter(o => isSameBangkokWeek(o.ts)).reduce((a, o) => a + o.baht, 0);
  const budgetLeft = WEEKLY_FOOD_BUDGET - weekBaht;
  const todaysOrders = s.orders.filter(o => isSameBangkokDate(o.ts));
  const favPlaces = s.favs.map(id => places.find(p => p.id === id)).filter((p): p is Place => Boolean(p));

  return (
    <TabScroll>
      <div style={{ background: 'var(--ink)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lbl" style={{ color: 'var(--grey)', whiteSpace: 'nowrap' }}>{live ? 'NEAR YOU · LIVE' : 'NEAR YOU · SIAM SQUARE'}</div>
          <div style={{ font: "400 22px/1.15 'Source Serif 4',serif", color: 'var(--cream)', marginTop: 8 }}>
            {loading ? 'Finding what’s close…' : todaysOrders.length ? 'Ordered. Sit down and eat it.' : "It's late. Something fast, then bed."}
          </div>
        </div>
        <div style={{ textAlign: 'right', flex: 'none' }}>
          <div className="lbl" style={{ color: 'var(--grey)', whiteSpace: 'nowrap' }}>FOOD · ฿{WEEKLY_FOOD_BUDGET}/WK</div>
          <div style={{ font: "400 22px/1 'Source Serif 4',serif", color: 'var(--orange)', marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>฿{budgetLeft.toLocaleString()}</div>
        </div>
      </div>

      {!placesConfigured && (
        <div style={{ padding: '10px 16px', background: 'var(--panel)', font: "400 12px/1.4 'Source Serif 4',serif", color: 'var(--slate)' }}>
          Showing five real, verified Siam Square spots — tap a thumbnail to drop in your own photo. Set VITE_GOOGLE_MAPS_API_KEY for live places + real storefront photos near you.
        </div>
      )}
      {error && <div style={{ padding: '10px 16px', font: "400 12px/1.4 'Source Serif 4',serif", color: '#9a4d00' }}>{error} — showing the starter list instead.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '2px solid var(--ink)' }}>
        {['FASTEST', 'BEST RATED', 'CHEAPEST'].map((label, i) => (
          <button key={label} className="tab" style={{ background: s.sort === i ? '#232323' : 'transparent', color: s.sort === i ? '#f0ece6' : '#4d545e', fontSize: 9, padding: '12px 0' }}
            onClick={() => s.setSort(i)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {sorted.map(p => {
          const saved = s.favs.includes(p.id);
          return (
            <div key={p.id} style={{ padding: '13px 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 52, height: 52, background: '#f0ece6', flex: 'none', filter: p.photoUrl ? 'none' : 'grayscale(1)' }}>
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <ImageUpload
                    id={`place-${p.id}`} value={s.placePhotos[p.id] ?? null} placeholder="add a photo"
                    onChange={url => s.setPlacePhoto(p.id, url)}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ font: "400 16px/1.2 'Source Serif 4',serif" }}>{p.name}</div>
                  <div style={{ font: "600 9.5px/1.4 'Archivo'", letterSpacing: '.1em', color: p.eta <= 12 ? '#9a4d00' : '#4d545e', whiteSpace: 'nowrap' }}>{p.eta} MIN{p.source === 'google' ? '*' : ''}</div>
                </div>
                <div style={{ font: "400 13px/1.35 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 4 }}>{p.desc}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 9, font: "600 9px/1 'Archivo'", letterSpacing: '.1em', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#232323', background: '#cbc7c1', padding: '4px 6px' }}>★ {p.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--slate)' }}>{p.band} · ฿{p.baht}</span>
                  {p.kcal > 0 && <span style={{ color: 'var(--slate)' }}>{p.kcal} KCAL</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                  <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap', borderColor: saved ? '#fa8317' : '#232323', background: saved ? '#fa8317' : 'transparent' }}
                    onClick={() => s.toggleFav(p.id)}>{saved ? 'SAVED' : 'SAVE'}</button>
                  <button className="btn2" style={{ width: 'auto', padding: '7px 9px', fontSize: 9, whiteSpace: 'nowrap' }}
                    onClick={() => s.orderPlace(p.name, p.kcal, p.baht)}>ORDER</button>
                </div>
              </div>
            </div>
          );
        })}
        {sorted.some(p => p.source === 'google') && (
          <div style={{ font: "400 11px/1.4 'Source Serif 4',serif", color: 'var(--grey)', padding: '8px 0' }}>*ETA is estimated from distance — Google Places doesn't expose delivery-app dispatch times.</div>
        )}
      </div>

      <div style={{ borderTop: '2px solid var(--ink)', background: 'var(--panel)', padding: '13px 16px 16px', marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="lbl">FAVOURITES</span>
          <span style={{ font: "600 9.5px/1 'Archivo'", letterSpacing: '.12em', color: 'var(--slate)' }}>{favPlaces.length} SAVED</span>
        </div>
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 9 }}>
          {favPlaces.length ? 'Saved from what you actually liked, not what was cheapest.' : 'Nothing saved yet. Hit SAVE on anything you would eat twice.'}
        </div>
        {favPlaces.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ font: "400 15px/1.2 'Source Serif 4',serif" }}>{p.name}</span>
            <button className="btn2" style={{ width: 'auto', padding: '6px 8px', fontSize: 9 }} onClick={() => s.orderPlace(p.name, p.kcal, p.baht)}>ORDER AGAIN</button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px solid var(--ink)', padding: '13px 16px 18px' }}>
        <div className="lbl">TODAY'S ORDERS → BODY</div>
        {todaysOrders.map((o, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)', font: "400 15px/1.2 'Source Serif 4',serif" }}>
            <span>{o.name}</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--slate)' }}>{o.kcal} kcal · ฿{o.baht}</span>
          </div>
        ))}
        <div style={{ font: "400 14px/1.4 'Source Serif 4',serif", color: 'var(--slate)', marginTop: 11 }}>
          {todaysOrders.length
            ? `${todaysOrders.reduce((a, o) => a + o.kcal, 0)} kcal logged to BODY.`
            : 'Nothing ordered today yet.'}
        </div>
      </div>
    </TabScroll>
  );
}
