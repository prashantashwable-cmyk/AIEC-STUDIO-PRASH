import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Lead } from '../types';

// Real (non-demo) lead persistence, backed by Firestore `leads/{leadId}`.
// Admin sessions subscribe to the whole collection; a non-admin real session
// (e.g. a surveyor) can only subscribe to leads they own, since that's all
// firestore.rules lets a non-admin `list` query prove is safe.

const stripUndefined = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

export function subscribeFirestoreLeads(
  scope: { isAdmin: boolean; uid: string },
  onChange: (leads: Lead[]) => void
): () => void {
  if (!db) {
    console.error('Firestore is not initialized.');
    return () => {};
  }
  const leadsQuery = scope.isAdmin
    ? collection(db, 'leads')
    : query(collection(db, 'leads'), where('surveyorId', '==', scope.uid));

  return onSnapshot(
    leadsQuery,
    (snap) => onChange(snap.docs.map(d => d.data() as Lead)),
    (err) => console.error('Firestore leads subscription failed:', err)
  );
}

export async function addFirestoreLead(lead: Lead): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  await setDoc(doc(db, 'leads', lead.id), stripUndefined(lead));
}

export async function updateFirestoreLead(lead: Lead): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  await setDoc(doc(db, 'leads', lead.id), stripUndefined(lead), { merge: true });
}
