'use client';

import { useState } from 'react';
import RuletaMesas from '../components/RuletasMesa';

export default function PaginaAdmin() {
  const [numMesas, setNumMesas] = useState(16);
  const [ruletaGenerada, setRuletaGenerada] = useState(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '2rem' }}>
      <h1>Panel de Administración</h1>

      {!ruletaGenerada && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', background: '#1a1a24', padding: '2rem', borderRadius: '12px' }}>
          <label>
            Número de mesas:{' '}
            <input
              type="number" min={2} max={50} value={numMesas}
              onChange={(e) => setNumMesas(Number(e.target.value))}
              style={{ marginLeft: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: 'none', width: '80px' }}
            />
          </label>
          <button
            onClick={() => setRuletaGenerada(true)}
            style={{ padding: '0.75rem 1.5rem', background: '#1d3557', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Generar Ruleta
          </button>
        </div>
      )}

      {ruletaGenerada && (
        <>
          <RuletaMesas numMesas={numMesas} />
          <button
            onClick={() => setRuletaGenerada(false)}
            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#aaa', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Cambiar número de mesas
          </button>
        </>
      )}
    </main>
  );
}