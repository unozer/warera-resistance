import React, { useState, useEffect } from 'react';
import { fetchCountries, fetchRegions } from './api';
import { calculateResistanceTargets } from './logic';
import './App.css';

const REL_COLORS = {
  casa: '#e2e8f0',
  amico: '#10b981',
  nemico: '#ef4444',
  'nemico del nemico': '#f59e0b',
  neutrale: '#64748b',
};

const RegionRow = ({ reg }) => (
  <tr className={`res-row res-fascia-${reg.fascia || 'none'}`}>
    <td className="text-center">{reg.fascia ? `Fascia ${reg.fascia}` : '-'}</td>
    <td><b>{reg.name}</b></td>
    <td className="res-manca">
      <span className="res-percent-bar">
        <span className="res-percent-fill" style={{ width: `${Math.min(100, Math.max(0, reg.percent))}%` }} />
        <span className="res-percent-text">{reg.percent}%</span>
      </span>
      {reg.manca > 0 && <span className="res-manca-pts">(-{reg.manca})</span>}
    </td>
    <td>
      <span style={{ color: REL_COLORS[reg.ownerRel] || 'inherit' }}>{reg.owner}</span>
      <span className="res-rel-label">({reg.ownerRel})</span>
    </td>
    <td>
      <span style={{ color: REL_COLORS[reg.holderRel] || 'inherit' }}>{reg.holder}</span>
      <span className="res-rel-label">({reg.holderRel})</span>
    </td>
  </tr>
);

function App() {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState({});
  const [countryId, setCountryId] = useState('6813b6d446e731854c7ac7a2'); // Italy default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cList, rDict] = await Promise.all([fetchCountries(), fetchRegions()]);
        
        // Sort countries alphabetically
        cList.sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(cList);
        setRegions(rDict);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCountryChange = (e) => {
    setCountryId(e.target.value);
  };

  let targets = { pushing: [], ready: [], warning: [] };
  if (!loading && !error && countries.length > 0) {
    const countriesDict = countries.reduce((acc, c) => ({ ...acc, [c._id]: c }), {});
    targets = calculateResistanceTargets(regions, countriesDict, countryId);
  }

  const activeCountry = countries.find(c => c._id === countryId);

  return (
    <div className="container">
      <header className="header">
        <h1>🔥 WarEra - Resistenza</h1>
        <p>Strumento strategico per trovare le regioni in cui conviene contribuire alla resistenza.</p>
      </header>

      <div className="card filters">
        <label>
          <span className="label-text">Seleziona la tua nazione:</span>
          <select value={countryId} onChange={handleCountryChange} disabled={loading}>
            {!countryId && <option value="">Scegli una nazione...</option>}
            {countries.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <main className="main-content">
        {loading && <div className="state-message">Caricamento dati in corso...</div>}
        {error && <div className="state-message error">Impossibile caricare i dati: {error}</div>}

        {!loading && !error && (
          <div className="card">
            <h3>🏹 Dove Spingere</h3>
            <p className="subtitle">
              Le regioni con barra parziale, in ordine di priorità (Amici, poi Nemici dei nemici, infine Neutrali) e di vicinanza al 100%. 
              Le regioni dove conviene spendere energia.
            </p>

            {targets.pushing.length === 0 ? (
              <div className="state-message empty">Nessuna regione utile trovata al momento.</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-center">Fascia</th>
                      <th>Regione</th>
                      <th>Manca</th>
                      <th>Chi la riprende</th>
                      <th>Chi la tiene</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targets.pushing.map(reg => <RegionRow key={reg.regionId} reg={reg} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        I dati vengono scaricati live tramite le API pubbliche di WarEra.
      </footer>
    </div>
  );
}

export default App;
