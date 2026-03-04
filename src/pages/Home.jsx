import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllTournaments } from '../utils/firebaseOps';

export default function Home() {
  const navigate = useNavigate();
  const [activeTournament, setActiveTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActive();
  }, []);

  async function loadActive() {
    try {
      const tournaments = await getAllTournaments();
      const active = tournaments.find(t => t.status === 'active');
      setActiveTournament(active || null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Pádel con<br />los Pibes</h1>
        <p className="subtitle">🏓 TORNEOS EN EL TERRÓN (GRACIAS LUKI😝)</p>
      </div>

      <div className="flex flex-col gap-16 mt-24">
        {activeTournament && (
          <div className="animate-slide-up delay-1">
            <button
              className="card w-full"
              onClick={() => navigate(`/torneo/${activeTournament.id}`)}
              style={{ textAlign: 'left', cursor: 'pointer', borderColor: 'var(--accent)', boxShadow: '0 0 24px rgba(232,255,71,0.12)', padding: '20px' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="phase-label current">⚡ En curso</span>
                <span className="text-xs text-muted">{activeTournament.playerCount} jugadores</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '1.5px', color: 'var(--accent)' }}>
                🏓 TORNEO ACTIVO
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--green)', marginTop: '8px', fontWeight: 600 }}>
                Tocá para continuar →
              </div>
            </button>
          </div>
        )}

        <div className="animate-slide-up delay-2">
          <button className="btn btn-primary" onClick={() => navigate('/nuevo')} style={{ height: '64px', fontSize: '1.05rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Nuevo Torneo de Puntos
          </button>
        </div>

        <div className="animate-slide-up delay-3">
          <button className="btn btn-secondary" onClick={() => navigate('/sorteo')} style={{ height: '58px' }}>
            🎲 Sorteo Rápido
          </button>
        </div>

        <div className="animate-slide-up delay-4">
          <button className="btn btn-secondary" onClick={() => navigate('/historial')} style={{ height: '58px' }}>
            🕐 Ver Historial
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px', opacity: 0.3 }}>
        <div style={{ fontSize: '2rem' }}>🎾</div>
        <div className="text-xs" style={{ marginTop: '8px', letterSpacing: '2px' }}>VAMOS QUE SE PUEDE</div>
      </div>
    </div>
  );
}
