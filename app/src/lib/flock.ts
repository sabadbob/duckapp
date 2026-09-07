// Realtime "The Flock" data — reads flocks/{code}/members via onSnapshot so
// streaks update live across everyone in the flock, no manual refresh.

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase';
import type { FlockMember } from '../types';

export function useFlockMembers(flockCode: string | null): FlockMember[] {
  const [members, setMembers] = useState<FlockMember[]>([]);

  useEffect(() => {
    if (!firebaseReady || !db || !flockCode) { setMembers([]); return; }
    const q = query(collection(db, 'flocks', flockCode, 'members'));
    const unsub = onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => d.data() as FlockMember));
    });
    return unsub;
  }, [flockCode]);

  return members;
}

export function generateFlockCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
