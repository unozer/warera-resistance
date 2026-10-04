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

  const isRuleActive = (ruleKey, currentRules) => {
    if (ruleKey === 'show_allied_held_by_me') return currentRules[ruleKey] === true;
    return currentRules[ruleKey] !== false; // others default to true
  };

  const toggleRule = (ruleKey) => {
    setOverrides(prev => {
      const currentRules = prev.rules || {};
      const currentValue = isRuleActive(ruleKey, currentRules);
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

  const isChecked = (key) => isRuleActive(key, rules);

  const renderSection = (bucket, title, badgeClass, labels, rulesConfig) => {
    const bucketCountries = Object.entries(manualCountries).filter(([id, b]) => b === bucket || (bucket === 'alleato' && b === 'amico') || (bucket === 'nemico comune' && b === 'nemico del nemico'));
    const bucketCoalitions = Object.entries(manualCoalitions).filter(([id, b]) => b === bucket || (bucket === 'alleato' && b === 'amico') || (bucket === 'nemico comune' && b === 'nemico del nemico'));

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
          <h4>{labels.alliance}</h4>
          <ul className="settings-manual-list">
            {bucketCoalitions.map(([coId]) => (
              <li key={coId}>
                <span>{coalitions[coId]?.name || `Alleanza ${coId}`}</span>
                <button className="settings-btn-clear" onClick={() => removeManualCoalition(coId)}>X</button>
              </li>
            ))}
            {bucketCoalitions.length === 0 && <li className="settings-empty-li">Aggiungi alleanza manualmente.</li>}
          </ul>
          <div className="settings-add-row">
            <select 
              value={newCoalition[bucket] || ''} 
              onChange={e => setNewCoalition(p => ({ ...p, [bucket]: e.target.value }))}
              className="settings-select"
            >
              <option value="">-- Seleziona Alleanza --</option>
              {Object.values(coalitions).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button className="settings-btn-add" onClick={() => addManualCoalition(bucket)}>Aggiungi</button>
          </div>
        </div>

        <div className="settings-block">
          <h4>{labels.country}</h4>
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
            {bucketCountries.length === 0 && <li className="settings-empty-li">Aggiungi nazione manualmente.</li>}
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

      {renderSection('alleato', 'Alleati', 'badge-alleato', { alliance: 'Alleanze Alleate', country: 'Nazioni Alleate' }, [
        { key: 'amici_dp', label: 'Patti Difensivi' },
        { key: 'amici_coalition', label: 'Stessa Alleanza' },
        { key: 'show_allied_held_by_me', label: 'Mostra regioni alleate occupate dalla nazione selezionata' }
      ])}
      
      {renderSection('nemico', 'Nemici', 'badge-nemico', { alliance: 'Alleanze Nemiche', country: 'Nazioni Nemiche' }, [
        { key: 'nemici_wars', label: 'Guerre Attive' },
        { key: 'nemici_ne', label: 'Nemico Giurato' }
      ])}
      
      {renderSection('nemico comune', 'Nemici Comuni', 'badge-nemico-comune', { alliance: 'Alleanze Nemiche Comuni', country: 'Nazioni Nemiche Comuni' }, [
        { key: 'eoe_wars', label: 'Nazioni in guerra contro i nostri Nemici' },
        { key: 'eoe_ne', label: 'Nazioni aventi i nostri Nemici come Nemico Giurato' }
      ])}
      
      {renderSection('neutrale', 'Neutrali', 'badge-neutrale', { alliance: 'Alleanze Neutrali', country: 'Nazioni Neutrali' }, null)}
    </div>
  );
}
