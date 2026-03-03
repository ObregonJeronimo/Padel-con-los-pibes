import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewTournament from './pages/NewTournament';
import TournamentSetup from './pages/TournamentSetup';
import TournamentLive from './pages/TournamentLive';
import TournamentDetail from './pages/TournamentDetail';
import SorteoRapido from './pages/SorteoRapido';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo" element={<NewTournament />} />
        <Route path="/setup" element={<TournamentSetup />} />
        <Route path="/torneo/:id" element={<TournamentLive />} />
        <Route path="/historial/:id" element={<TournamentDetail />} />
        <Route path="/sorteo" element={<SorteoRapido />} />
      </Routes>
    </BrowserRouter>
  );
}
