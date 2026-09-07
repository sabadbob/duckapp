// Live restaurant data via the Google Places API (New) — Nearby Search + Photo
// media endpoints, called directly from the client with a restricted API key
// (see app/README.md for how to lock the key down to Places API + your domain).
//
// Two things Places genuinely does not have, so they're clearly estimated
// rather than faked as real: delivery ETA (that's Grab/LINE MAN's private
// dispatch data) is approximated from straight-line distance, and kcal isn't
// returned at all, so it's simply omitted for live results.

import type { Place } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
export const placesConfigured = Boolean(API_KEY);

interface RawPlace {
  id: string;
  displayName?: { text: string };
  rating?: number;
  priceLevel?: string;
  location?: { latitude: number; longitude: number };
  photos?: { name: string }[];
  primaryTypeDisplayName?: { text: string };
}

const PRICE_BAND: Record<string, string> = {
  PRICE_LEVEL_FREE: '฿', PRICE_LEVEL_INEXPENSIVE: '฿', PRICE_LEVEL_MODERATE: '฿฿',
  PRICE_LEVEL_EXPENSIVE: '฿฿฿', PRICE_LEVEL_VERY_EXPENSIVE: '฿฿฿฿',
};
const PRICE_BAHT_GUESS: Record<string, number> = {
  PRICE_LEVEL_FREE: 60, PRICE_LEVEL_INEXPENSIVE: 120, PRICE_LEVEL_MODERATE: 260,
  PRICE_LEVEL_EXPENSIVE: 500, PRICE_LEVEL_VERY_EXPENSIVE: 900,
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

function estimateEtaMinutes(km: number): number {
  // ~18km/h effective delivery speed in central Bangkok traffic + 8min prep/pickup floor.
  return Math.round(8 + (km / 18) * 60);
}

export function photoUrl(photoName: string, maxWidthPx = 400): string | null {
  if (!API_KEY) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${API_KEY}`;
}

export async function searchNearbyRestaurants(center: { lat: number; lng: number }, radiusM = 3000): Promise<Place[]> {
  if (!API_KEY) throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set');
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.priceLevel,places.location,places.photos',
    },
    body: JSON.stringify({
      includedTypes: ['restaurant'],
      maxResultCount: 20,
      locationRestriction: { circle: { center: { latitude: center.lat, longitude: center.lng }, radius: radiusM } },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Places API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const places: RawPlace[] = json.places ?? [];

  return places
    .filter(p => p.displayName?.text && p.location)
    .map(p => {
      const km = haversineKm(center, { lat: p.location!.latitude, lng: p.location!.longitude });
      const band = p.priceLevel ? PRICE_BAND[p.priceLevel] ?? '฿฿' : '฿฿';
      const baht = p.priceLevel ? PRICE_BAHT_GUESS[p.priceLevel] ?? 200 : 200;
      return {
        id: p.id,
        name: p.displayName!.text,
        desc: p.primaryTypeDisplayName?.text ?? 'Restaurant nearby',
        eta: estimateEtaMinutes(km),
        rating: p.rating ?? 4.0,
        baht,
        kcal: 0,
        band,
        photoUrl: p.photos?.[0] ? photoUrl(p.photos[0].name) : null,
        lat: p.location!.latitude,
        lng: p.location!.longitude,
        source: 'google' as const,
      };
    });
}

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  const SIAM_SQUARE = { lat: 13.7466, lng: 100.5347 };
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(SIAM_SQUARE); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(SIAM_SQUARE),
      { timeout: 6000 },
    );
  });
}
