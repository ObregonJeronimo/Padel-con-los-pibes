import { db } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, getDoc, getDocs, 
  query, orderBy, serverTimestamp, Timestamp 
} from 'firebase/firestore';

const TOURNAMENTS_COL = 'tournaments';

// Create a new tournament session
export async function createTournament(data) {
  try {
    const docRef = await addDoc(collection(db, TOURNAMENTS_COL), {
      players: data.players,
      playerCount: data.players.length,
      scores: data.players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
      rounds: [],
      currentRound: null,
      status: 'active', // active | paused | finished
      startedAt: serverTimestamp(),
      finishedAt: null,
      previousPairings: []
    });
    return docRef.id;
  } catch (e) {
    console.error('Error creating tournament:', e);
    throw e;
  }
}

// Get tournament by ID
export async function getTournament(id) {
  try {
    const docSnap = await getDoc(doc(db, TOURNAMENTS_COL, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        startedAt: data.startedAt?.toDate?.() || new Date(data.startedAt),
        finishedAt: data.finishedAt?.toDate?.() || (data.finishedAt ? new Date(data.finishedAt) : null)
      };
    }
    return null;
  } catch (e) {
    console.error('Error getting tournament:', e);
    throw e;
  }
}

// Update tournament
export async function updateTournament(id, data) {
  try {
    await updateDoc(doc(db, TOURNAMENTS_COL, id), data);
  } catch (e) {
    console.error('Error updating tournament:', e);
    throw e;
  }
}

// Finish tournament
export async function finishTournament(id) {
  try {
    await updateDoc(doc(db, TOURNAMENTS_COL, id), {
      status: 'finished',
      finishedAt: serverTimestamp()
    });
  } catch (e) {
    console.error('Error finishing tournament:', e);
    throw e;
  }
}

// Resume a finished tournament
export async function resumeTournament(id) {
  try {
    await updateDoc(doc(db, TOURNAMENTS_COL, id), {
      status: 'active',
      finishedAt: null
    });
  } catch (e) {
    console.error('Error resuming tournament:', e);
    throw e;
  }
}

// Get all tournaments (for history)
export async function getAllTournaments() {
  try {
    const q = query(collection(db, TOURNAMENTS_COL), orderBy('startedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        startedAt: data.startedAt?.toDate?.() || new Date(data.startedAt),
        finishedAt: data.finishedAt?.toDate?.() || (data.finishedAt ? new Date(data.finishedAt) : null)
      };
    });
  } catch (e) {
    console.error('Error getting tournaments:', e);
    throw e;
  }
}
