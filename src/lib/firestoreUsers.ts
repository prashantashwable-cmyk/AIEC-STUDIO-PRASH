import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import { User } from '../types';

// Real (non-demo) user persistence, backed by Firestore `users/{uid}` — uid is the
// Firebase Auth uid, matching the firestore.rules check `request.auth.uid == userId`.
// Demo-mode sessions never call this: they stay on DbManager's local fake store,
// so a demo "Try as Admin" click can never read or write real production data.

const stripUndefined = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

export async function getOrCreateFirestoreUser(firebaseUser: FirebaseUser): Promise<User> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }
  const email = firebaseUser.email?.toLowerCase() || '';
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as User;
  }

  // Owner/Founder email auto-maps to the admin role on first real sign-in.
  const isOwner = email === 'prashantashwable@gmail.com';

  const newUser: User = stripUndefined({
    id: firebaseUser.uid,
    role: isOwner ? 'admin' : ('pending_selection' as any),
    name: firebaseUser.displayName || 'Google User',
    phone: firebaseUser.phoneNumber || '',
    email,
    status: isOwner ? 'active' : 'pending',
    avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  });

  await setDoc(ref, newUser);
  return newUser;
}

export async function updateFirestoreUser(user: User): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }
  const ref = doc(db, 'users', user.id);
  await setDoc(ref, stripUndefined(user), { merge: true });
}
