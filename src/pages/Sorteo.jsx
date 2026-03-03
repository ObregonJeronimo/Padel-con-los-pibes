import { useState } from 'react';
import { shuffle } from '../utils/tournament';

export default function Sorteo() {
  const [step, setStep] = useState(1);
  const [count, setCount] = useState('');
  const [names, setNames] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [hasPrizes, setHasPrizes] = useState(false);
  const [result, setResult] = useState([]);
  const [reshuffleCount, setReshuffleCount] = useState(0);

  function handleSetCount() {
    const n = parseInt(count);
    if (n < 2 || n > 50) return;
    setNames(Array(n).fill(''));
    setPrizes(Array(n).fill(''));
    setStep(2);
  }

  function updateName(i, val) { const arr = [...names]; arr[i] = val; setNames(arr); }
  function updatePrize(i, val) { const arr = [...prizes]; arr[i] = val; setPrizes(arr); }

  function doSorteo() {
    const shuffled = shuffle(names.map(n => n.trim()));
    if (hasPrizes) {
      setResult(shuffled.map((name, i) => ({ name, prize: prizes[i]?.trim() || `Puesto ${i + 1}` })));
    } else {
      setResult(shuffled.map((name, i) => ({ name, position: i + 1 })));
    }
    setReshuffleCount(0);
    setStep(3);
  }

  function handleReshuffle() {
    if (reshuffleCount >= 2) return;
    const shuffled = shuffle(names.map(n => n.trim()));
    if (hasPrizes) {
      setResult(shuffled.map((name, i) => ({ name, prize: prizes[i]?.trim() || `Puesto ${i + 1}` })));
    } else {
      setResult(shuffled.map((name, i) => ({ name, position: i + 1 })));
    }
    setReshuffleCount(prev => prev + 1);
  }

  function reset() {
    setStep(1); setCount(''); setNames([]); setPrizes([]); setResult([]); setReshuffleCount(0); setHasPrizes(false);
  }

  const allFilled = names.every(n => n.trim().length > 0);
  const prizesOk = !hasPrizes || prizes.every(p => p.trim().length > 0);

  return (
    <div className="page">
      <div className="header animate-fade">
        <h1>Sorteo</h1>
        <p className="subtitle">🎲 Aleatorio para lo que quieras</p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-16 mt-24 animate-slide-up">
          <div className="section-title text-center">¿Cuántos participantes?</div>
          <input className="input" type="number" min="2" max="50" placeholder="Ej: 6, 8, 10..." value={count} onChange={(e) => setCount(e.target.value)} style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }} />
          <label className="flex items-center gap-12" style={{ cursor: 'pointer' }}>
            <div onClick={() => setHasPrizes(!hasPrizes)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: hasPrizes ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: hasPrizes ? '#0a0a0a' : 'var(--text-muted)', position: 'absolute', top: '2px', left: hasPrizes ? '22px' : '2px', transition: 'all 0.2s' }} />
            </div>
            <span className="text-sm">Incluir premios/puestos</span>
          </label>
          <button className="btn btn-primary" onClick={handleSetCount} disabled={!count || parseInt(count) < 2}>Siguiente →</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-12 mt-24 animate-slide-up">
          <div className="section-title text-center">Participantes</div>
          {names.map((name, i) => (
            <div key={i} className="animate-fade" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center gap-8">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                <input className="input" type="text" placeholder={`Participante ${i + 1}`} value={name} onChange={(e) => updateName(i, e.target.value)} maxLength={30} style={{ padding: '10px 14px' }} />
                {hasPrizes && (
                  <input className="input" type="text" placeholder={`Premio ${i + 1}`} value={prizes[i]} onChange={(e) => updatePrize(i, e.target.value)} maxLength={30} style={{ padding: '10px 14px', maxWidth: '140px' }} />
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-12 mt-16">
            <button className="btn btn-primary" onClick={doSorteo} disabled={!allFilled || !prizesOk}>🎲 Sortear</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>← Volver</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-16 mt-24 animate-scale">
          <div className="text-center">
            <div style={{ fontSize: '2.5rem' }}>🎉</div>
            <div className="section-title mt-8">¡Resultado del sorteo!</div>
          </div>
          <div className="flex flex-col gap-8">
            {result.map((r, i) => (
              <div key={i} className="sorteo-card animate-fade" style={{ animationDelay: `${i * 0.08}s`, borderColor: i === 0 ? 'var(--accent)' : 'var(--border)', boxShadow: i === 0 ? '0 0 20px rgba(232,255,71,0.1)' : 'none' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-12">
                    <div className={`rank-badge ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default'}`}>{i + 1}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.name}</div>
                  </div>
                  {r.prize && (
                    <span className="chip" style={{ background: 'rgba(232,255,71,0.1)', borderColor: 'rgba(232,255,71,0.2)', color: 'var(--accent)' }}>🎁 {r.prize}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-12">
            {reshuffleCount < 2 && (
              <button className="btn btn-secondary" onClick={handleReshuffle}>
                🔄 Sortear de nuevo ({2 - reshuffleCount} {2 - reshuffleCount === 1 ? 'vez' : 'veces'} más)
              </button>
            )}
            <button className="btn btn-primary" onClick={reset}>✨ Nuevo sorteo</button>
          </div>
        </div>
      )}
    </div>
  );
}
