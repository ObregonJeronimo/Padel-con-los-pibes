// Shuffle array randomly (Fisher-Yates)
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Create random duos from players array
export function createDuos(players) {
  const shuffled = shuffle(players);
  const duos = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    duos.push({
      id: `duo-${i / 2}`,
      players: [shuffled[i], shuffled[i + 1]],
      name: `${shuffled[i]} & ${shuffled[i + 1]}`
    });
  }
  return duos;
}

// Try to create duos where players haven't played together before
// previousPairings is an array of STRINGS like "player1|player2" (Firestore compatible, no nested arrays)
export function createSmartDuos(players, previousPairings = []) {
  const pairingSet = new Set(previousPairings.map(p => {
    // Support both string format "a|b" and legacy array format [a,b]
    if (typeof p === 'string') return p.split('|').sort().join('|');
    const sorted = [...p].sort();
    return `${sorted[0]}|${sorted[1]}`;
  }));

  for (let attempt = 0; attempt < 100; attempt++) {
    const duos = createDuos(players);
    const allNew = duos.every(duo => {
      const key = [...duo.players].sort().join('|');
      return !pairingSet.has(key);
    });
    if (allNew) return duos;
  }

  return createDuos(players);
}

// Convert duo players to Firestore-safe string "player1|player2"
export function pairingToString(players) {
  return [...players].sort().join('|');
}

// Get next match for 6-player tournament
export function getNextMatch6(schedule, matchResults) {
  const { duos } = schedule;
  const played = matchResults.length;

  if (played === 0) {
    return { duo1: duos[0], duo2: duos[1], waiting: [duos[2]], matchNumber: 1 };
  }

  if (played === 1) {
    const winnerDuo = matchResults[0].winner;
    const loserDuo = matchResults[0].loser;
    const waitingDuo = duos[2];
    return { duo1: winnerDuo, duo2: waitingDuo, waiting: [loserDuo], matchNumber: 2 };
  }

  if (played === 2) {
    const playedPairs = new Set();
    matchResults.forEach(r => {
      const key = [r.winner.id, r.loser.id].sort().join('|');
      playedPairs.add(key);
    });

    for (let i = 0; i < duos.length; i++) {
      for (let j = i + 1; j < duos.length; j++) {
        const key = [duos[i].id, duos[j].id].sort().join('|');
        if (!playedPairs.has(key)) {
          const waiting = duos.filter((_, idx) => idx !== i && idx !== j);
          return { duo1: duos[i], duo2: duos[j], waiting, matchNumber: 3 };
        }
      }
    }
  }

  return null;
}

// Get next match for 8-player tournament
export function getNextMatch8(schedule, matchResults) {
  const { duos } = schedule;
  const played = matchResults.length;

  if (played === 0) {
    return { duo1: duos[0], duo2: duos[2], waiting: [duos[1], duos[3]], matchNumber: 1, phase: 1 };
  }

  if (played === 1) {
    return { duo1: duos[1], duo2: duos[3], waiting: [duos[0], duos[2]], matchNumber: 2, phase: 1 };
  }

  if (played === 2) {
    const loser1 = matchResults[0].loser;
    const loser2 = matchResults[1].loser;
    const winner1 = matchResults[0].winner;
    const winner2 = matchResults[1].winner;
    return { duo1: loser1, duo2: loser2, waiting: [winner1, winner2], matchNumber: 3, phase: 2, label: 'Perdedores vs Perdedores' };
  }

  if (played === 3) {
    const winner1 = matchResults[0].winner;
    const winner2 = matchResults[1].winner;
    const loser1 = matchResults[0].loser;
    const loser2 = matchResults[1].loser;
    return { duo1: winner1, duo2: winner2, waiting: [loser1, loser2], matchNumber: 4, phase: 2, label: 'Ganadores vs Ganadores' };
  }

  if (played >= 4) {
    const playedPairs = new Set();
    matchResults.forEach(r => {
      const key = [r.winner.id, r.loser.id].sort().join('|');
      playedPairs.add(key);
    });

    for (let i = 0; i < duos.length; i++) {
      for (let j = i + 1; j < duos.length; j++) {
        const key = [duos[i].id, duos[j].id].sort().join('|');
        if (!playedPairs.has(key)) {
          const waiting = duos.filter((_, idx) => idx !== i && idx !== j);
          return { duo1: duos[i], duo2: duos[j], waiting, matchNumber: played + 1, phase: 3 };
        }
      }
    }
  }

  return null;
}

// Format time
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}
