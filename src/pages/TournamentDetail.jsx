import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, resumeTournament } from '../utils/firebaseOps';
import { formatDate, formatTime } from '../utils/tournament';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadTournament(); }, [id]);

  async function loadTournament() {
    try { const t = await getTournament(id); setTournament(t); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleResume() {
    await resumeTournament(id);
    navigate(`/torneo/${id}`, { replace: true });
  }

  if (loading) return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  if (!tournament) return <div className="page"><div className="empty-state"><div className="icon">🤷</div><div>Torneo no encontrado</div></div></div>;

  const sorted = Object.entries(tournament.scores || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Detalle</h1>
        <p className="subtitle">{tournament.startedAt ? formatDate(tournament.startedAt) : ''}</p>
      </div>

      <div className="card mb-16 animate-fade">
        <div className="flex items-center justify-between mb-8">
          <span className={`phase-label ${tournament.status === 'active' ? 'current' : 'done'}`}>
            {tournament.status === 'active' ? '⚡ En curso' : '✓ Finalizado'}
          </span>
          <span className="text-xs text-muted">{tournament.playerCount} jugadores</span>
        </div>
        <div className="text-xs text-muted">Inicio: {tournament.startedAt ? formatTime(tournament.startedAt) : '—'}</div>
        {tournament.finishedAt && <div className="text-xs text-muted mt-8">Fin: {formatTime(tournament.finishedAt)}</div>}
        <div className="text-xs text-muted mt-8">Rondas jugadas: {tournament.rounds?.length || 0}</div>
      </div>

      <div className="mb-24 animate-slide-up delay-1">
        <div className="section-title">🏆 Tabla de posiciones</div>
        <div className="flex flex-col gap-8">
          {sorted.map(([name, pts], i) => (
            <div key={name} className="leaderboard-row animate-fade" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`rank-badge ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default'}`}>{i + 1}</div>
              <div style={{ flex: 1, fontWeight: 600 }}>{name}</div>
              <div className="score-badge" style={{ background: pts > 0 ? 'rgba(232,255,71,0.12)' : 'var(--bg-elevated)', color: pts > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{pts} pts</div>
            </div>
          ))}
        </div>
      </div>

      {tournament.rounds && tournament.rounds.length > 0 && (
        <div className="mb-24 animate-slide-up delay-2">
          <div className="section-title">📋 Rondas</div>
          <div className="flex flex-col gap-8">
            {tournament.rounds.map((round, ri) => (
              <div key={ri}>
                <button className="card w-full" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => setExpanded(expanded === ri ? null : ri)}>
                  <div className="flex items-center justify-between">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ronda #{round.roundNumber || ri + 1}</div>
                    <div className="text-xs text-muted">{round.matchResults?.length || 0} partidos · {expanded === ri ? '▲' : '▼'}</div>
                  </div>
                  <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
                    {round.duos?.map((d, di) => <span key={di} className="chip">{d.players[0]} &amp; {d.players[1]}</span>)}
                  </div>
                </button>
                {expanded === ri && round.matchResults && (
                  <div className="flex flex-col gap-8 mt-8" style={{ paddingLeft: '12px' }}>
                    {round.matchResults.map((r, mi) => (
                      <div key={mi} className="card animate-fade" style={{ padding: '12px' }}>
                        <div className="flex items-center gap-8">
                          <span className="text-xs text-muted">#{mi + 1}</span>
                          <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.85rem' }}>🏆 {r.winner.name}</span>
                          <span className="text-xs text-muted">vs</span>
                          <span className="text-xs" style={{ opacity: 0.6 }}>{r.loser.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12 animate-slide-up delay-3">
        {tournament.status === 'finished' && (
          <button className="btn btn-green" onClick={handleResume}>▶ Reanudar torneo</button>
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/historial')}>← Volver al historial</button>
      </div>
    </div>
  );
}
