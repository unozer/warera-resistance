import React from 'react';
import { Flag } from './Flag';
import { getAllCountryRelationships } from '../logic';

const EXPLANATIONS = {
  amico: {
    title: "Amici",
    desc: "Nazioni con cui condividiamo un'Alleanza o un Patto Difensivo attivo."
  },
  nemico: {
    title: "Nemici",
    desc: "Nazioni con cui siamo in guerra attiva o impostate come Nemico Naturale."
  },
  'nemico del nemico': {
    title: "Nemici dei Nemici",
    desc: "Nazioni in guerra o nemiche dei nostri nemici."
  },
  neutrale: {
    title: "Neutrali",
    desc: "Tutte le altre nazioni."
  }
};

const ExternalLink = ({ type, id, children, className }) => (
  <a 
    href={`https://app.warera.io/${type}/${id}`} 
    target="_blank" 
    rel="noreferrer"
    className={className || "external-link"}
  >
    {children}
  </a>
);

export function SettingsPanel({ countries, homeId, overrides, setOverrides }) {
  if (!countries || countries.length === 0) return null;

  const countriesDict = countries.reduce((acc, c) => ({ ...acc, [c._id]: c }), {});
  const groups = getAllCountryRelationships(countriesDict, homeId, overrides);

  const handleOverride = (countryId, newRel) => {
    setOverrides(prev => {
      const next = { ...prev };
      next[countryId] = newRel;
      return next;
    });
  };

  const clearOverride = (countryId) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[countryId];
      return next;
    });
  };

  const renderGroup = (key, badgeClass) => {
    const list = groups[key];
    const { title, desc } = EXPLANATIONS[key];

    return (
      <div key={key} className="settings-section">
        <div className="settings-section-header">
          <h3 className={`badge ${badgeClass}`}>{title}</h3>
          <p className="settings-desc">{desc}</p>
        </div>
        
        <div className="settings-list">
          {list.length === 0 ? (
            <div className="settings-empty">Nessuna nazione in questa categoria.</div>
          ) : (
            list.map(c => (
              <div key={c._id} className="settings-item">
                <div className="settings-item-country">
                  <Flag code={c.code} />
                  <ExternalLink type="country" id={c._id}>
                    {c.name}
                  </ExternalLink>
                  {overrides[c._id] === key && (
                    <span className="override-badge" title="Forzato manualmente">⚙️ manuale</span>
                  )}
                </div>
                
                <select 
                  className="settings-override-select"
                  value={key}
                  onChange={(e) => {
                    // Se rimetto al default, elimino l'override? Non posso sapere il default qui senza ricalcolare.
                    // Sovrascrivo e basta.
                    handleOverride(c._id, e.target.value);
                  }}
                >
                  <option value="amico">Sposta in Amici</option>
                  <option value="nemico">Sposta in Nemici</option>
                  <option value="nemico del nemico">Sposta in Nemici dei Nemici</option>
                  <option value="neutrale">Sposta in Neutrali</option>
                </select>
                
                {overrides[c._id] && (
                  <button className="settings-btn-clear" onClick={() => clearOverride(c._id)}>
                    Resetta
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="settings-panel">
      <h2>Impostazioni Diplomazia</h2>
      <p className="subtitle">
        Qui puoi forzare manualmente le relazioni diplomatiche. 
        Le modifiche manuali (⚙️) sovrascriveranno le regole automatiche e verranno salvate nel tuo browser.
      </p>

      {renderGroup('amico', 'badge-amico')}
      {renderGroup('nemico', 'badge-nemico')}
      {renderGroup('nemico del nemico', 'badge-nemico-del-nemico')}
      {renderGroup('neutrale', 'badge-neutrale')}
    </div>
  );
}
