import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament } from '../utils/firebaseOps';

export default function NewTournament() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [count, setCount] = useState(null);
  const [names, setNames] = useState([]);
  const [saving, setSaving] = useState(false);

  function selectCount(n) {
    setCount(n);
    setNames(Array(n).fill(''));
    setStep(2);
  }

  function updateName(index, value) {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  }

  const allFilled = names.every(n => n.trim().length > 0);
  const hasDuplicates = new Set(names.map(n => n.trim().toLowerCase())).size !== names.length;

  async function handleStart() {
    if (!allFilled || hasDuplicates) return;
    setSaving(true);
    try {
      const cleanNames = names.map(n => n.trim());
      const id = await createTournament({ players: cleanNames });
      navigate(`/torneo/${id}`, { replace: true });
    } catch (e) {
      alert('Error al crear torneo: ' + e.message);
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Nuevo Torneo</h1>
        <p className="subtitle">Puntos individuales</p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-16 mt-24 animate-slide-up">
          <div className="section-title text-center">¿Cuántos juegan?</div>
          <button className="card w-full" onClick={() => selectCount(6)} style={{ cursor: 'pointer', textAlign: 'center', padding: '28px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent)' }}>6</div>
            <div className="text-sm text-muted mt-8">3 equipos × 2 jugadores</div>
            <div className="text-xs text-muted mt-8">Todos vs todos (3 partidos)</div>
          </button>
          <button className="card w-full" onClick={() => selectCount(8)} style={{ cursor: 'pointer', textAlign: 'center', padding: '28px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent)' }}>8</div>
            <div className="text-sm text-muted mt-8">4 equipos × 2 jugadores</div>
            <div className="text-xs text-muted mt-8">Todos vs todos (6 partidos)</div>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>← Volver</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-12 mt-24 animate-slide-up">
          <div className="section-title text-center">Nombres de los pibes</div>
          <div className="section-subtitle text-center">{count} jugadores — escribí los nombres</div>
          {names.map((name, i) => (
            <div key={i} className="animate-fade" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-12">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                <input className="input" type="text" placeholder={`Jugador ${i + 1}`} value={name} onChange={(e) => updateName(i, e.target.value)} autoFocus={i === 0} maxLength={20} />
              </div>
            </div>
          ))}
          {hasDuplicates && allFilled && (
            <div className="text-xs" style={{ color: 'var(--red)', textAlign: 'center' }}>⚠️ Hay nombres repetidos</div>
          )}
          <div className="flex flex-col gap-12 mt-16">
            <button className="btn btn-primary" onClick={handleStart} disabled={!allFilled || hasDuplicates || saving}>
              {saving ? 'Creando...' : '🏓 Empezar Torneo'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>← Cambiar cantidad</button>
          </div>
        </div>
      )}
    </div>
  );
}
