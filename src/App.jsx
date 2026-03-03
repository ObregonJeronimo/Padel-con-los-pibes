import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import NewTournament from './pages/NewTournament';
import ActiveTournament from './pages/ActiveTournament';
import History from './pages/History';
import TournamentDetail from './pages/TournamentDetail';
import Sorteo from './pages/Sorteo';

const VALID_USER = 'terron123';
const VALID_PASS = 'terron123';
const AUTH_KEY = 'padel_pibes_auth';

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (user === VALID_USER && pass === VALID_PASS) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div className="animate-fade" style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--accent)', letterSpacing: '2px', lineHeight: 1, textTransform: 'uppercase' }}>
            Pádel con<br />los Pibes
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            🏓 TORNEOS EN EL TERRÓN
          </p>
        </div>

        <div className={`card animate-slide-up ${shaking ? 'shake' : ''}`} style={{ padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Iniciar sesión</div>
          </div>

          <div className="flex flex-col gap-16">
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Usuario</label>
              <input
                className="input"
                type="text"
                placeholder="Usuario"
                value={user}
                onChange={(e) => { setUser(e.target.value); setError(false); }}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Contraseña"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(false); }}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>

            {error && (
              <div className="animate-fade" style={{ fontSize: '0.85rem', color: 'var(--red)', textAlign: 'center' }}>
                ⚠️ Usuario o contraseña incorrectos
              </div>
            )}

            <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: '4px' }}>
              Entrar 🎾
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', opacity: 0.4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            Hecho por <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Jerónimo Obregón</span> (SUPER PRO)
          </div>
        </div>
      </div>

      <style>{`
        .shake {
          animation: shakeAnim 0.5s ease-in-out;
        }
        @keyframes shakeAnim {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${path === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Inicio
      </button>
      <button className={`nav-item ${path === '/sorteo' ? 'active' : ''}`} onClick={() => navigate('/sorteo')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 4l3 3-3 3"/><path d="M18 20l3-3-3-3"/>
          <path d="M3 7h4l5 5-5 5H3"/><path d="M21 7h-4l-1.5 1.5"/>
          <path d="M21 17h-4l-1.5-1.5"/>
        </svg>
        Sorteo
      </button>
      <button className={`nav-item ${path === '/historial' ? 'active' : ''}`} onClick={() => navigate('/historial')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Historial
      </button>
    </nav>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true');

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo" element={<NewTournament />} />
        <Route path="/torneo/:id" element={<ActiveTournament />} />
        <Route path="/historial" element={<History />} />
        <Route path="/historial/:id" element={<TournamentDetail />} />
        <Route path="/sorteo" element={<Sorteo />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
