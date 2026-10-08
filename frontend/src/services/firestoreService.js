import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const PATIENTS_COLLECTION = 'patients';
const SESSIONS_COLLECTION = 'sessions';
const USERS_COLLECTION = 'users';

/**
 * Clean data object so Firestore does not reject undefined fields.
 */
function sanitizeForFirestore(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// ==========================================
// PATIENT OPERATIONS
// ==========================================

export async function savePatientToFirestore(userId, patient) {
  if (!patient || !patient.id) {
    throw new Error('Patient ID is required to save to Firestore');
  }

  const patientDocRef = doc(db, PATIENTS_COLLECTION, patient.id);
  const data = sanitizeForFirestore({
    ...patient,
    userId: userId || 'anonymous',
    updatedAt: serverTimestamp(),
    createdAt: patient.createdAt || serverTimestamp()
  });

  await setDoc(patientDocRef, data, { merge: true });
  return patient;
}

export async function deletePatientFromFirestore(patientId) {
  if (!patientId) return;
  const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
  await deleteDoc(patientDocRef);
}

export async function getPatientsFromFirestore(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, PATIENTS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const patients = [];
    querySnapshot.forEach((docSnap) => {
      patients.push({ id: docSnap.id, ...docSnap.data() });
    });
    return patients;
  } catch (err) {
    console.error('Error fetching patients from Firestore:', err);
    throw err;
  }
}

export function subscribeToPatients(userId, onUpdate, onError) {
  if (!userId) return () => {};

  const q = query(
    collection(db, PATIENTS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const patients = [];
      querySnapshot.forEach((docSnap) => {
        patients.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(patients);
    },
    (error) => {
      console.warn('Firestore patients subscription warning:', error);
      if (onError) onError(error);
    }
  );
}

// ==========================================
// SESSION / ASSESSMENTS OPERATIONS
// ==========================================

export async function saveSessionToFirestore(userId, session) {
  if (!session || !session.id) {
    throw new Error('Session ID is required to save to Firestore');
  }

  // Audio object URLs cannot be stored in Firestore, so we omit audioUrl
  const { audioUrl, ...serializableSession } = session;

  const sessionDocRef = doc(db, SESSIONS_COLLECTION, session.id);
  const data = sanitizeForFirestore({
    ...serializableSession,
    userId: userId || 'anonymous',
    updatedAt: serverTimestamp(),
    createdAt: session.createdAt || serverTimestamp()
  });

  await setDoc(sessionDocRef, data, { merge: true });
  return session;
}

export async function deleteSessionFromFirestore(sessionId) {
  if (!sessionId) return;
  const sessionDocRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(sessionDocRef);
}

export async function getSessionsFromFirestore(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const sessions = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...docSnap.data() });
    });
    return sessions;
  } catch (err) {
    console.error('Error fetching sessions from Firestore:', err);
    throw err;
  }
}

export function subscribeToSessions(userId, onUpdate, onError) {
  if (!userId) return () => {};

  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const sessions = [];
      querySnapshot.forEach((docSnap) => {
        sessions.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort newest first
      sessions.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
        return timeB - timeA;
      });
      onUpdate(sessions);
    },
    (error) => {
      console.warn('Firestore sessions subscription warning:', error);
      if (onError) onError(error);
    }
  );
}

// ==========================================
// USER PROFILE OPERATIONS
// ==========================================

export async function saveUserProfileToFirestore(userId, profile) {
  if (!userId) return;
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const data = sanitizeForFirestore({
    ...profile,
    updatedAt: serverTimestamp()
  });
  await setDoc(userDocRef, data, { merge: true });
}

export async function getUserProfileFromFirestore(userId) {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const snapshot = await getDoc(userDocRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore:', err);
    return null;
  }
}

// ==========================================
// HEALTH CHECK / CONNECTION TEST
// ==========================================

export async function testFirestoreConnection() {
  try {
    const testDocRef = doc(db, '_connection_test', 'status');
    await setDoc(testDocRef, {
      lastChecked: serverTimestamp(),
      status: 'connected',
      client: 'ParkinsonVoice Web App'
    }, { merge: true });
    return { success: true, message: 'Connected to Firestore successfully' };
  } catch (error) {
    console.warn('Firestore connection test failed or restricted by security rules:', error.message);
    return { success: false, message: error.message };
  }
}
