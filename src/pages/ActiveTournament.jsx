import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, updateTournament, finishTournament } from '../utils/firebaseOps';
import { createDuos, createSmartDuos, getNextMatch6, getNextMatch8 } from '../utils/tournament';

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

function MatchView({ match, onWinner, matchNumber, totalMatches }) {
  if (!match) return null;
  return (
    <div className="match-card active animate-scale">
      <div className="flex items-center justify-between mb-8">
        <span className="phase-label current">🎾 Partido {matchNumber}/{totalMatches}</span>
        {match.label && <span className="chip">{match.label}</span>}
      </div>
      <div className="flex flex-col gap-12 mt-16">
        <div className="text-center text-xs text-muted mb-8" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>¿Quién ganó?</div>
        <div className="flex gap-12">
          <button className="duo-card" onClick={() => onWinner(match.duo1, match.duo2)}>
            <div className="player-name">{match.duo1.players[0]}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: '2px 0' }}>&amp;</div>
            <div className="player-name">{match.duo1.players[1]}</div>
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600 }}>✓ GANÓ</div>
          </button>
          <div className="flex items-center"><span className="vs-text">VS</span></div>
          <button className="duo-card" onClick={() => onWinner(match.duo2, match.duo1)}>
            <div className="player-name">{match.duo2.players[0]}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: '2px 0' }}>&amp;</div>
            <div className="player-name">{match.duo2.players[1]}</div>
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600 }}>✓ GANÓ</div>
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

function CompletedMatch({ result, index }) {
  return (
    <div className="match-card completed animate-fade" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-center justify-between mb-8">
        <span className="phase-label done">✓ Partido {index + 1}</span>
      </div>
      <div className="flex items-center gap-12">
        <div className="duo-card winner" style={{ cursor: 'default' }}>
          <div className="text-xs" style={{ color: 'var(--green)', marginBottom: '4px' }}>🏆</div>
          <div className="player-name" style={{ fontSize: '0.8rem' }}>{result.winner.name}</div>
        </div>
        <span className="vs-text" style={{ fontSize: '1rem' }}>vs</span>
        <div className="duo-card loser" style={{ cursor: 'default' }}>
          <div className="player-name" style={{ fontSize: '0.8rem' }}>{result.loser.name}</div>
        </div>
      </div>
    </div>
  );
}

function SorteoView({ duos, onReshuffle, onConfirm, reshuffleCount }) {
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
          <button className="btn btn-secondary" onClick={onReshuffle}>
            🔄 Volver a sortear ({2 - reshuffleCount} {2 - reshuffleCount === 1 ? 'vez' : 'veces'} más)
          </button>
        )}
        <button className="btn btn-primary" onClick={onConfirm}>✅ Confirmar y empezar</button>
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

export default function ActiveTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
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
    } catch (e) { console.error(e); }
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
    const newPairings = duos.map(d => d.players);
    await updateTournament(id, {
      currentRound: { duos, matchResults: [], phase: 'playing' },
      previousPairings: [...(tournament.previousPairings || []), ...newPairings]
    });
    setPhase('playing');
    const nextMatch = tournament.playerCount === 6
      ? getNextMatch6({ duos }, [])
      : getNextMatch8({ duos }, []);
    setCurrentMatch(nextMatch);
  }

  async function handleWinner(winnerDuo, loserDuo) {
    const newResult = { winner: winnerDuo, loser: loserDuo };
    const newResults = [...matchResults, newResult];
    setMatchResults(newResults);
    const newScores = { ...tournament.scores };
    winnerDuo.players.forEach(p => { newScores[p] = (newScores[p] || 0) + 1; });
    const totalMatches = tournament.playerCount === 6 ? 3 : 6;
    const isRoundComplete = newResults.length >= totalMatches;
    if (isRoundComplete) {
      const roundData = { duos, matchResults: newResults, roundNumber };
      await updateTournament(id, {
        scores: newScores,
        rounds: [...(tournament.rounds || []), roundData],
        currentRound: { ...tournament.currentRound, matchResults: newResults, phase: 'round-end' }
      });
      setTournament(prev => ({ ...prev, scores: newScores, rounds: [...(prev.rounds || []), roundData] }));
      setPhase('round-end');
    } else {
      await updateTournament(id, {
        scores: newScores,
        currentRound: { duos, matchResults: newResults, phase: 'playing' }
      });
      setTournament(prev => ({ ...prev, scores: newScores }));
      const nextMatch = tournament.playerCount === 6
        ? getNextMatch6({ duos }, newResults)
        : getNextMatch8({ duos }, newResults);
      setCurrentMatch(nextMatch);
    }
  }

  async function handleContinue() {
    setRoundNumber(prev => prev + 1);
    setPhase('sorteo');
    setMatchResults([]);
    setCurrentMatch(null);
    await updateTournament(id, { currentRound: null });
    doSorteo(tournament);
  }

  async function handleFinish() {
    await finishTournament(id);
    await updateTournament(id, { currentRound: null });
    navigate(`/historial/${id}`, { replace: true });
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
      {phase !== 'round-end' && phase !== 'sorteo' && (
        <div className="mb-24 animate-fade">
          <div className="flex items-center justify-between mb-8">
            <div className="section-title" style={{ marginBottom: 0, fontSize: '1rem' }}>📊 Tabla</div>
            <div className="chip">Ronda {roundNumber}</div>
          </div>
          <Leaderboard scores={tournament.scores} small />
        </div>
      )}
      {phase === 'playing' && matchResults.length > 0 && (
        <div className="mb-24">
          <div className="section-title" style={{ fontSize: '1rem' }}>Partidos jugados</div>
          <div className="flex flex-col gap-8">
            {matchResults.map((r, i) => <CompletedMatch key={i} result={r} index={i} />)}
          </div>
        </div>
      )}
      {phase === 'sorteo' && duos.length > 0 && (
        <SorteoView duos={duos} onReshuffle={handleReshuffle} onConfirm={handleConfirmSorteo} reshuffleCount={reshuffleCount} />
      )}
      {phase === 'playing' && currentMatch && (
        <MatchView match={currentMatch} onWinner={handleWinner} matchNumber={matchResults.length + 1} totalMatches={totalMatches} />
      )}
      {phase === 'round-end' && (
        <RoundEndView scores={tournament.scores} onContinue={handleContinue} onFinish={handleFinish} roundNumber={roundNumber} />
      )}
    </div>
  );
}
