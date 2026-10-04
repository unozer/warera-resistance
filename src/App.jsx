import React, { useState } from 'react';
import { useWareraData } from './hooks/useWareraData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ResistanceTable } from './components/ResistanceTable';
import { CountrySelect } from './components/CountrySelect';
import { SettingsPanel } from './components/SettingsPanel';
import { FistIcon, XIcon } from './components/Icons';
import './App.css';

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-icon">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

function App() {
  const [countryId, setCountryId] = useState('6813b6d446e731854c7ac7a2'); // Italy default
  const [showSettings, setShowSettings] = useState(false);
  const [overrides, setOverrides] = useLocalStorage('warera_overrides', {});
  
  const { countries, coalitions, loading, error, targets } = useWareraData(countryId, overrides);

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
            <div className="top-bar">
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
              
              <button 
                className={`btn-icon ${showSettings ? 'active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
                title={showSettings ? "Chiudi Impostazioni" : "Impostazioni Diplomazia"}
              >
                {showSettings ? <XIcon /> : <SettingsIcon />}
              </button>
            </div>
            
            {showSettings ? (
              <SettingsPanel 
                countries={countries} 
                coalitions={coalitions}
                homeId={countryId} 
                overrides={overrides} 
                setOverrides={setOverrides} 
              />
            ) : (
              <ResistanceTable data={targets.pushing} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
