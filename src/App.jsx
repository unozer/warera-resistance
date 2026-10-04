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

const FistIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="28" height="28" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M304 48c0-26.5-21.5-48-48-48s-48 21.5-48 48v86.1c0 10.6-9.1 18.9-19.6 17.9l-26.9-2.6c-20.3-2-38.6 12-41.5 32.2l-4.5 31.4C111 210.1 82.5 224 53.9 224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h224c88.4 0 160-71.6 160-160V144c0-26.5-21.5-48-48-48h-11.4c-8.9 0-16.6-6.4-18.4-15l-4.7-22.1c-2.4-11.3 6.1-20.9 16.9-20.9H384c26.5 0 48-21.5 48-48s-21.5-48-48-48h-80z"/>
  </svg>
);

const RegionRow = ({ reg }) => (
  <tr className="res-row">
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
  
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cList, rDict] = await Promise.all([fetchCountries(), fetchRegions()]);
        
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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (!sortConfig || sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  let targets = { pushing: [] };
  if (!loading && !error && countries.length > 0) {
    const countriesDict = countries.reduce((acc, c) => ({ ...acc, [c._id]: c }), {});
    const calculated = calculateResistanceTargets(regions, countriesDict, countryId);
    
    let sortableItems = [...calculated.pushing];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle sorting text (case insensitive)
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    targets.pushing = sortableItems;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>
          <FistIcon />
          WarEra RESISTANCE
        </h1>
      </header>

      <main className="main-content">
        {loading && <div className="state-message">Caricamento dati in corso...</div>}
        {error && <div className="state-message error">Impossibile caricare i dati: {error}</div>}

        {!loading && !error && (
          <div className="card">
            
            <div className="filters">
              <label>
                <span className="label-text">Nazione:</span>
                <select value={countryId} onChange={handleCountryChange} disabled={loading}>
                  {!countryId && <option value="">Scegli una nazione...</option>}
                  {countries.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {targets.pushing.length === 0 ? (
              <div className="state-message empty" style={{ marginTop: '2rem' }}>
                Nessuna regione utile trovata al momento.
              </div>
            ) : (
              <div className="table-responsive" style={{ marginTop: '2rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                        Regione{getSortIndicator('name')}
                      </th>
                      <th onClick={() => requestSort('manca')} style={{ cursor: 'pointer' }}>
                        Manca{getSortIndicator('manca')}
                      </th>
                      <th onClick={() => requestSort('owner')} style={{ cursor: 'pointer' }}>
                        Chi la riprende{getSortIndicator('owner')}
                      </th>
                      <th onClick={() => requestSort('holder')} style={{ cursor: 'pointer' }}>
                        Chi la tiene{getSortIndicator('holder')}
                      </th>
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
