import React, { useState } from 'react';
import { Flag } from './Flag';

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

export function SettingsPanel({ countries, coalitions, overrides, setOverrides }) {
  const [newCountry, setNewCountry] = useState({});
  const [newCoalition, setNewCoalition] = useState({});

  const rules = overrides.rules || {};
  const manualCountries = overrides.manualCountries || {};
  const manualCoalitions = overrides.manualCoalitions || {};

  const toggleRule = (ruleKey) => {
    setOverrides(prev => {
      const currentRules = prev.rules || {};
      const currentValue = currentRules[ruleKey] !== false; // true if true or undefined
      return {
        ...prev,
        rules: {
          ...currentRules,
          [ruleKey]: !currentValue
        }
      };
    });
  };

  const addManualCountry = (bucket) => {
    const cid = newCountry[bucket];
    if (!cid) return;
    setOverrides(prev => ({
      ...prev,
      manualCountries: { ...(prev.manualCountries || {}), [cid]: bucket }
    }));
    setNewCountry(p => ({ ...p, [bucket]: '' }));
  };

  const removeManualCountry = (cid) => {
    setOverrides(prev => {
      const next = { ...prev };
      const nextMC = { ...next.manualCountries };
      delete nextMC[cid];
      next.manualCountries = nextMC;
      return next;
    });
  };

  const addManualCoalition = (bucket) => {
    const coId = newCoalition[bucket];
    if (!coId) return;
    setOverrides(prev => ({
      ...prev,
      manualCoalitions: { ...(prev.manualCoalitions || {}), [coId]: bucket }
    }));
    setNewCoalition(p => ({ ...p, [bucket]: '' }));
  };

  const removeManualCoalition = (coId) => {
    setOverrides(prev => {
      const next = { ...prev };
      const nextMC = { ...next.manualCoalitions };
      delete nextMC[coId];
      next.manualCoalitions = nextMC;
      return next;
    });
  };

  const isChecked = (key) => rules[key] !== false; // true by default

  const renderSection = (bucket, title, badgeClass, rulesConfig) => {
    const bucketCountries = Object.entries(manualCountries).filter(([id, b]) => b === bucket);
    const bucketCoalitions = Object.entries(manualCoalitions).filter(([id, b]) => b === bucket);

    return (
      <div className="settings-section">
        <div className="settings-section-header">
          <h3 className={`badge ${badgeClass}`}>{title}</h3>
        </div>

        {rulesConfig && rulesConfig.length > 0 && (
          <div className="settings-block">
            <h4>Regole Automatiche</h4>
            <div className="settings-rules">
              {rulesConfig.map(r => (
                <label key={r.key} className="settings-rule-label">
                  <input 
                    type="checkbox" 
                    checked={isChecked(r.key)} 
                    onChange={() => toggleRule(r.key)} 
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="settings-block">
          <h4>Coalizioni {title} (Manuali)</h4>
          <ul className="settings-manual-list">
            {bucketCoalitions.map(([coId]) => (
              <li key={coId}>
                <span>{coalitions[coId]?.name || `Coalizione ${coId}`}</span>
                <button className="settings-btn-clear" onClick={() => removeManualCoalition(coId)}>X</button>
              </li>
            ))}
            {bucketCoalitions.length === 0 && <li className="settings-empty-li">Nessuna coalizione aggiunta manualmente.</li>}
          </ul>
          <div className="settings-add-row">
            <select 
              value={newCoalition[bucket] || ''} 
              onChange={e => setNewCoalition(p => ({ ...p, [bucket]: e.target.value }))}
              className="settings-select"
            >
              <option value="">-- Seleziona Coalizione --</option>
              {Object.values(coalitions).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button className="settings-btn-add" onClick={() => addManualCoalition(bucket)}>Aggiungi</button>
          </div>
        </div>

        <div className="settings-block">
          <h4>Nazioni {title} (Manuali)</h4>
          <ul className="settings-manual-list">
            {bucketCountries.map(([cId]) => {
              const c = countries.find(x => x._id === cId);
              if (!c) return null;
              return (
                <li key={cId}>
                  <div className="settings-item-country">
                    <Flag code={c.code} />
                    <ExternalLink type="country" id={c._id}>{c.name}</ExternalLink>
                  </div>
                  <button className="settings-btn-clear" onClick={() => removeManualCountry(cId)}>X</button>
                </li>
              );
            })}
            {bucketCountries.length === 0 && <li className="settings-empty-li">Nessuna nazione aggiunta manualmente.</li>}
          </ul>
          <div className="settings-add-row">
            <select 
              value={newCountry[bucket] || ''} 
              onChange={e => setNewCountry(p => ({ ...p, [bucket]: e.target.value }))}
              className="settings-select"
            >
              <option value="">-- Seleziona Nazione --</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button className="settings-btn-add" onClick={() => addManualCountry(bucket)}>Aggiungi</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-panel">
      <h2>Impostazioni Diplomazia</h2>
      <p className="subtitle">
        Scegli quali metriche di gioco determinano le relazioni, e aggiungi manualmente coalizioni o nazioni specifiche.
        Le impostazioni manuali hanno sempre priorità su quelle automatiche.
      </p>

      {renderSection('amico', 'Amici', 'badge-amico', [
        { key: 'amici_dp', label: 'Patti Difensivi' },
        { key: 'amici_coalition', label: 'Stessa Coalizione' }
      ])}
      
      {renderSection('nemico', 'Nemici', 'badge-nemico', [
        { key: 'nemici_wars', label: 'Guerre Attive' },
        { key: 'nemici_ne', label: 'Nemico Naturale' }
      ])}
      
      {renderSection('nemico del nemico', 'Nemici dei Nemici', 'badge-nemico-del-nemico', [
        { key: 'eoe_wars', label: 'Nazioni in guerra contro i nostri Nemici' },
        { key: 'eoe_ne', label: 'Nazioni aventi i nostri Nemici come Nemico Naturale' }
      ])}
      
      {renderSection('neutrale', 'Neutrali', 'badge-neutrale', null)}
    </div>
  );
}
