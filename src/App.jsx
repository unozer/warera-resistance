import React, { useState } from 'react';
import { useWareraData } from './hooks/useWareraData';
import { ResistanceTable } from './components/ResistanceTable';
import { CountrySelect } from './components/CountrySelect';
import { FistIcon } from './components/Icons';
import './App.css';

function App() {
  const [countryId, setCountryId] = useState('6813b6d446e731854c7ac7a2'); // Italy default
  const { countries, loading, error, targets } = useWareraData(countryId);

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
                <CountrySelect 
                  countries={countries} 
                  value={countryId} 
                  onChange={setCountryId} 
                  disabled={loading} 
                />
              </label>
            </div>
            
            <ResistanceTable data={targets.pushing} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
