import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTournaments } from '../utils/firebaseOps';
import { formatDate, formatTime } from '../utils/tournament';

export default function History() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTournaments(); }, []);

  async function loadTournaments() {
    try { const data = await getAllTournaments(); setTournaments(data); } catch (e) { console.error(e); }
    setLoading(false);
  }

  function handleClick(t) {
    if (t.status === 'active') { navigate(`/torneo/${t.id}`); } else { navigate(`/historial/${t.id}`); }
  }

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Historial</h1>
        <p className="subtitle">Todos los torneos</p>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : tournaments.length === 0 ? (
        <div className="empty-state animate-fade">
          <div className="icon">📋</div>
          <div>No hay torneos todavía</div>
          <div className="text-xs text-muted mt-8">Creá uno desde el inicio</div>
        </div>
      ) : (
        <div className="flex flex-col gap-12 mt-16">
          {tournaments.map((t, i) => (
            <button key={t.id} className="history-card animate-fade" style={{ animationDelay: `${i * 0.05}s`, textAlign: 'left' }} onClick={() => handleClick(t)}>
              <div className="flex items-center justify-between mb-8">
                <span className={`phase-label ${t.status === 'active' ? 'current' : 'done'}`}>
                  {t.status === 'active' ? '⚡ En curso' : '✓ Finalizado'}
                </span>
                <span className="date">{t.startedAt ? formatDate(t.startedAt) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="players-count">{t.playerCount} Jugadores</div>
                  <div className="text-xs text-muted mt-8">{t.players?.join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-xs text-muted">{t.rounds?.length || 0} rondas</div>
                  {t.startedAt && (
                    <div className="text-xs text-muted mt-8">
                      {formatTime(t.startedAt)}{t.finishedAt ? ` — ${formatTime(t.finishedAt)}` : ''}
                    </div>
                  )}
                </div>
              </div>
              {t.scores && (
                <div className="flex gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
                  {Object.entries(t.scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, pts], j) => (
                    <span key={name} className="chip">{j === 0 ? '🥇' : j === 1 ? '🥈' : '🥉'} {name}: {pts}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
