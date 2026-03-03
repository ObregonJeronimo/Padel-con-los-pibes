import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import NewTournament from './pages/NewTournament';
import ActiveTournament from './pages/ActiveTournament';
import History from './pages/History';
import TournamentDetail from './pages/TournamentDetail';
import Sorteo from './pages/Sorteo';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${path === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Inicio
      </button>
      <button
        className={`nav-item ${path === '/sorteo' ? 'active' : ''}`}
        onClick={() => navigate('/sorteo')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 4l3 3-3 3"/><path d="M18 20l3-3-3-3"/>
          <path d="M3 7h4l5 5-5 5H3"/><path d="M21 7h-4l-1.5 1.5"/>
          <path d="M21 17h-4l-1.5-1.5"/>
        </svg>
        Sorteo
      </button>
      <button
        className={`nav-item ${path === '/historial' ? 'active' : ''}`}
        onClick={() => navigate('/historial')}
      >
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
