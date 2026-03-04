import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, updateTournament, finishTournament } from '../utils/firebaseOps';
import { createSmartDuos, pairingToString, getNextMatch6, getNextMatch8 } from '../utils/tournament';

function Leaderboard({ scores, small = false }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex flex-col gap-8">
      {sorted.map(([name, pts], i) => (
        <div key={name} className={`leaderboard-row ${small ? '' : `animate-fade delay-${i + 1}`}`} style={small ? { padding: '8px 12px' } : {}}>
          <div className={`rank-badge ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default'}`}>{i + 1}</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: small ? '0.85rem' : '0.95rem' }}>{name}</div>
          <div className="score-badge" style={{ background: pts > 0 ? 'rgba(232,255,71,0.12)' : 'var(--bg-elevated)', color: pts > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{pts}</div>
        </div>
      ))}
    </div>
  );
}

function MatchView({ match, onWinner, matchNumber, totalMatches, disabled }) {
  if (!match) return null;
  return (
    <div className="match-card active animate-scale">
      <div className="flex items-center justify-between mb-8">
        <span className="phase-label current">🎾 Partido {matchNumber}/{totalMatches}</span>
        {match.label && <span className="chip">{match.label}</span>}
      </div>
      <div className="flex flex-col gap-12 mt-16">
        <div className="text-center mb-8" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase' }}>¿QUIÉN GANÓ?</div>
        <div className="flex gap-12">
          <button className="duo-card" onClick={() => !disabled && onWinner(match.duo1, match.duo2)} style={disabled ? {opacity:0.5} : {}}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{match.duo1.players[0]}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '4px 0' }}>&amp;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{match.duo1.players[1]}</div>
          </button>
          <div className="flex items-center"><span className="vs-text">VS</span></div>
          <button className="duo-card" onClick={() => !disabled && onWinner(match.duo2, match.duo1)} style={disabled ? {opacity:0.5} : {}}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{match.duo2.players[0]}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '4px 0' }}>&amp;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{match.duo2.players[1]}</div>
          </button>
        </div>
        {match.waiting && match.waiting.length > 0 && (
          <div className="text-center text-xs text-muted mt-8">
            <span style={{ opacity: 0.5 }}>Esperan: </span>{match.waiting.map(d => d.name).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

function CompletedMatch({ result, index, onSwap, disabled }) {
  return (
    <div className="match-card completed animate-fade" style={{ animationDelay: `${index * 0.05}s`, opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <span className="phase-label done">✓ Partido {index + 1}</span>
        <span className="text-xs text-muted" style={{ opacity: 0.5 }}>tocá para corregir</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="duo-card winner" style={{ cursor: 'default', padding: '10px 12px' }}>
          <div className="text-xs" style={{ color: 'var(--green)', marginBottom: '4px' }}>🏆 Ganó</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{result.winner.players[0]}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>&amp;</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{result.winner.players[1]}</div>
        </div>
        <span className="vs-text" style={{ fontSize: '0.9rem' }}>vs</span>
        <button
          className="duo-card loser"
          onClick={() => !disabled && onSwap(index)}
          style={{ padding: '10px 12px', opacity: 0.7, cursor: disabled ? 'not-allowed' : 'pointer' }}
          title="Tocá para cambiar el ganador"
        >
          <div className="text-xs" style={{ color: 'var(--red)', marginBottom: '4px' }}>Perdió</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{result.loser.players[0]}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>&amp;</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{result.loser.players[1]}</div>
        </button>
      </div>
    </div>
  );
}

function SorteoView({ duos, onReshuffle, onConfirm, reshuffleCount, saving }) {
  return (
    <div className="flex flex-col gap-16 animate-scale">
      <div className="text-center">
        <div className="section-title">🎲 Sorteo de equipos</div>
        <div className="text-xs text-muted">Los duos se armaron al azar</div>
      </div>
      <div className="flex flex-col gap-12">
        {duos.map((duo, i) => (
          <div key={duo.id} className="sorteo-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="text-xs text-muted mb-8" style={{ letterSpacing: '2px' }}>EQUIPO {i + 1}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {duo.players[0]} <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>&amp;</span> {duo.players[1]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-12">
        {reshuffleCount < 2 && (
          <button className="btn btn-secondary" onClick={onReshuffle} disabled={saving}>
            🔄 Volver a sortear ({2 - reshuffleCount} {2 - reshuffleCount === 1 ? 'vez' : 'veces'} más)
          </button>
        )}
        <button className="btn btn-primary" onClick={onConfirm} disabled={saving}>
          {saving ? 'Guardando...' : '✅ Confirmar y empezar'}
        </button>
      </div>
    </div>
  );
}

function RoundEndView({ scores, onContinue, onFinish, roundNumber }) {
  return (
    <div className="flex flex-col gap-20 animate-slide-up">
      <div className="text-center">
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
        <div className="section-title">Torneíto #{roundNumber} finalizado</div>
        <div className="text-xs text-muted">Puntos acumulados</div>
      </div>
      <Leaderboard scores={scores} />
      <div className="flex flex-col gap-12">
        <button className="btn btn-primary" onClick={onContinue}>🔄 Nuevo sorteo y seguir</button>
        <button className="btn btn-danger" onClick={onFinish}>🏁 Finalizar torneo</button>
      </div>
    </div>
  );
}

function serializeDuos(duos) {
  return duos.map(d => ({ id: d.id, players: [d.players[0], d.players[1]], name: d.name }));
}

function serializeResults(results) {
  return results.map(r => ({
    winner: { id: r.winner.id, players: [r.winner.players[0], r.winner.players[1]], name: r.winner.name },
    loser: { id: r.loser.id, players: [r.loser.players[0], r.loser.players[1]], name: r.loser.name }
  }));
}

// Recalculate all scores from scratch based on match results
function recalcScores(baseScores, oldResults, newResults) {
  const scores = { ...baseScores };
  // Undo old results
  oldResults.forEach(r => {
    r.winner.players.forEach(p => { scores[p] = (scores[p] || 0) - 1; });
  });
  // Apply new results
  newResults.forEach(r => {
    r.winner.players.forEach(p => { scores[p] = (scores[p] || 0) + 1; });
  });
  return scores;
}

export default function ActiveTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [duos, setDuos] = useState([]);
  const [reshuffleCount, setReshuffleCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);

  const load = useCallback(async () => {
    try {
      const t = await getTournament(id);
      if (!t) { navigate('/', { replace: true }); return; }
      setTournament(t);
      if (t.currentRound) {
        const cr = t.currentRound;
        setDuos(cr.duos || []);
        setMatchResults(cr.matchResults || []);
        setRoundNumber(t.rounds ? t.rounds.length + 1 : 1);
        if (cr.phase === 'round-end') {
          setPhase('round-end');
        } else if (cr.duos && cr.duos.length > 0 && cr.phase === 'playing') {
          setPhase('playing');
          const nextMatch = t.playerCount === 6
            ? getNextMatch6({ duos: cr.duos }, cr.matchResults || [])
            : getNextMatch8({ duos: cr.duos }, cr.matchResults || []);
          setCurrentMatch(nextMatch);
        } else {
          setPhase('sorteo');
          doSorteo(t);
        }
      } else {
        setRoundNumber(t.rounds ? t.rounds.length + 1 : 1);
        setPhase('sorteo');
        doSorteo(t);
      }
    } catch (e) {
      console.error('Load error:', e);
      setError('Error al cargar el torneo');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  function doSorteo(t) {
    const data = t || tournament;
    if (!data) return;
    const newDuos = createSmartDuos(data.players, data.previousPairings || []);
    setDuos(newDuos);
    setReshuffleCount(0);
    setMatchResults([]);
    setCurrentMatch(null);
  }

  function handleReshuffle() {
    if (reshuffleCount >= 2) return;
    const newDuos = createSmartDuos(tournament.players, tournament.previousPairings || []);
    setDuos(newDuos);
    setReshuffleCount(prev => prev + 1);
  }

  async function handleConfirmSorteo() {
    setSaving(true);
    setError(null);
    try {
      const plainDuos = serializeDuos(duos);
      const newPairingStrings = duos.map(d => pairingToString(d.players));
      await updateTournament(id, {
        currentRound: { duos: plainDuos, matchResults: [], phase: 'playing' },
        previousPairings: [...(tournament.previousPairings || []), ...newPairingStrings]
      });
      setTournament(prev => ({
        ...prev,
        previousPairings: [...(prev.previousPairings || []), ...newPairingStrings]
      }));
      setPhase('playing');
      const nextMatch = tournament.playerCount === 6
        ? getNextMatch6({ duos }, [])
        : getNextMatch8({ duos }, []);
      setCurrentMatch(nextMatch);
    } catch (e) {
      console.error('Confirm sorteo error:', e);
      setError('Error al guardar: ' + e.message);
    }
    setSaving(false);
  }

  async function handleWinner(winnerDuo, loserDuo) {
    setSaving(true);
    setError(null);
    try {
      const newResult = { winner: winnerDuo, loser: loserDuo };
      const newResults = [...matchResults, newResult];
      setMatchResults(newResults);
      const newScores = { ...tournament.scores };
      winnerDuo.players.forEach(p => { newScores[p] = (newScores[p] || 0) + 1; });
      const totalMatches = tournament.playerCount === 6 ? 3 : 6;
      const isRoundComplete = newResults.length >= totalMatches;

      const plainDuos = serializeDuos(duos);
      const plainResults = serializeResults(newResults);

      if (isRoundComplete) {
        const roundData = { duos: plainDuos, matchResults: plainResults, roundNumber };
        await updateTournament(id, {
          scores: newScores,
          rounds: [...(tournament.rounds || []), roundData],
          currentRound: { duos: plainDuos, matchResults: plainResults, phase: 'round-end' }
        });
        setTournament(prev => ({ ...prev, scores: newScores, rounds: [...(prev.rounds || []), roundData] }));
        setPhase('round-end');
      } else {
        await updateTournament(id, {
          scores: newScores,
          currentRound: { duos: plainDuos, matchResults: plainResults, phase: 'playing' }
        });
        setTournament(prev => ({ ...prev, scores: newScores }));
        const nextMatch = tournament.playerCount === 6
          ? getNextMatch6({ duos }, newResults)
          : getNextMatch8({ duos }, newResults);
        setCurrentMatch(nextMatch);
      }
    } catch (e) {
      console.error('Winner error:', e);
      setError('Error al guardar resultado: ' + e.message);
    }
    setSaving(false);
  }

  // SWAP a past result: invert winner/loser, recalc scores, recalc next match
  async function handleSwapResult(matchIndex) {
    setSaving(true);
    setError(null);
    try {
      const oldResults = [...matchResults];
      const swapped = { ...oldResults[matchIndex] };
      // Swap winner and loser
      const newResult = { winner: swapped.loser, loser: swapped.winner };
      const newResults = [...oldResults];
      newResults[matchIndex] = newResult;

      // Recalc scores: undo ALL old results from this round, redo with new
      const newScores = recalcScores(tournament.scores, oldResults, newResults);

      // For 6-player: matches after the swapped one depend on who won
      // We need to invalidate results after the swap point and recalculate flow
      // Truncate results after the swapped match (those are now invalid)
      const truncatedResults = newResults.slice(0, matchIndex + 1);

      // Recalc scores with only the truncated results
      const truncScores = recalcScores(tournament.scores, oldResults, truncatedResults);

      setMatchResults(truncatedResults);

      const plainDuos = serializeDuos(duos);
      const plainResults = serializeResults(truncatedResults);

      const totalMatches = tournament.playerCount === 6 ? 3 : 6;
      const isRoundComplete = truncatedResults.length >= totalMatches;

      if (isRoundComplete) {
        const roundData = { duos: plainDuos, matchResults: plainResults, roundNumber };
        await updateTournament(id, {
          scores: truncScores,
          rounds: [...(tournament.rounds || []), roundData],
          currentRound: { duos: plainDuos, matchResults: plainResults, phase: 'round-end' }
        });
        setTournament(prev => ({ ...prev, scores: truncScores, rounds: [...(prev.rounds || []), roundData] }));
        setPhase('round-end');
      } else {
        await updateTournament(id, {
          scores: truncScores,
          currentRound: { duos: plainDuos, matchResults: plainResults, phase: 'playing' }
        });
        setTournament(prev => ({ ...prev, scores: truncScores }));
        const nextMatch = tournament.playerCount === 6
          ? getNextMatch6({ duos }, truncatedResults)
          : getNextMatch8({ duos }, truncatedResults);
        setCurrentMatch(nextMatch);
      }
    } catch (e) {
      console.error('Swap error:', e);
      setError('Error al corregir resultado: ' + e.message);
    }
    setSaving(false);
  }

  async function handleContinue() {
    setRoundNumber(prev => prev + 1);
    setPhase('sorteo');
    setMatchResults([]);
    setCurrentMatch(null);
    try {
      await updateTournament(id, { currentRound: null });
    } catch (e) {
      console.error('Continue error:', e);
    }
    doSorteo(tournament);
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await finishTournament(id);
      await updateTournament(id, { currentRound: null });
      navigate(`/historial/${id}`, { replace: true });
    } catch (e) {
      console.error('Finish error:', e);
      setError('Error al finalizar.');
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  if (!tournament) return null;
  const totalMatches = tournament.playerCount === 6 ? 3 : 6;

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Torneo</h1>
        <p className="subtitle">{tournament.playerCount} jugadores · Ronda #{roundNumber}</p>
      </div>

      {error && (
        <div className="animate-fade" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {phase !== 'round-end' && phase !== 'sorteo' && (
        <div className="mb-24 animate-fade">
          <div className="flex items-center justify-between mb-8">
            <div className="section-title" style={{ marginBottom: 0, fontSize: '1rem' }}>📊 Tabla</div>
            <div className="chip">Ronda {roundNumber}</div>
          </div>
          <Leaderboard scores={tournament.scores} small />
        </div>
      )}

      {phase === 'sorteo' && duos.length > 0 && (
        <SorteoView duos={duos} onReshuffle={handleReshuffle} onConfirm={handleConfirmSorteo} reshuffleCount={reshuffleCount} saving={saving} />
      )}

      {phase === 'playing' && currentMatch && (
        <MatchView match={currentMatch} onWinner={handleWinner} matchNumber={matchResults.length + 1} totalMatches={totalMatches} disabled={saving} />
      )}

      {phase === 'playing' && matchResults.length > 0 && (
        <div className="mt-24">
          <div className="section-title" style={{ fontSize: '1rem' }}>Partidos jugados</div>
          <div className="text-xs text-muted mb-8" style={{ opacity: 0.6 }}>Tocá el perdedor para corregir el resultado</div>
          <div className="flex flex-col gap-8">
            {matchResults.map((r, i) => (
              <CompletedMatch key={i} result={r} index={i} onSwap={handleSwapResult} disabled={saving} />
            ))}
          </div>
        </div>
      )}

      {phase === 'round-end' && (
        <>
          <RoundEndView scores={tournament.scores} onContinue={handleContinue} onFinish={handleFinish} roundNumber={roundNumber} />
          {matchResults.length > 0 && (
            <div className="mt-24">
              <div className="section-title" style={{ fontSize: '1rem' }}>Resultados de la ronda</div>
              <div className="text-xs text-muted mb-8" style={{ opacity: 0.6 }}>Tocá el perdedor para corregir antes de continuar</div>
              <div className="flex flex-col gap-8">
                {matchResults.map((r, i) => (
                  <CompletedMatch key={i} result={r} index={i} onSwap={handleSwapResult} disabled={saving} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
