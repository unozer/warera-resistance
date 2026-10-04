import { useState, useEffect } from 'react';
import { fetchCountries, fetchRegions } from '../api';
import { calculateResistanceTargets } from '../logic';

const DEFAULT_CONFIG = {
  rules: {
    amici_dp: true,
    amici_coalition: true,
    nemici_wars: true,
    nemici_ne: true,
    eoe_wars: true,
    eoe_ne: true,
    show_allied_held_by_me: false,
  },
  manualCountries: {},
  manualCoalitions: {}
};

export function useWareraData(countryId, config = {}) {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState({});
  const [coalitions, setCoalitions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cList, rDict] = await Promise.all([
          fetchCountries(), 
          fetchRegions()
        ]);
        
        cList.sort((a, b) => a.name.localeCompare(b.name));
        
        // Derive coalitions from countries
        const coalDict = {};
        cList.forEach(c => {
          if (c.allianceId) {
            if (!coalDict[c.allianceId]) {
              coalDict[c.allianceId] = { _id: c.allianceId, name: `Alleanza (${c.name})`, members: [] };
            }
            coalDict[c.allianceId].members.push(c.name);
          }
        });
        
        // Refine coalition names based on members
        Object.values(coalDict).forEach(coal => {
            const topMembers = coal.members.slice(0, 3).join(", ");
            coal.name = `Alleanza [${topMembers}${coal.members.length > 3 ? '...' : ''}]`;
        });
        
        setCountries(cList);
        setRegions(rDict);
        setCoalitions(coalDict);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  let targets = { pushing: [] };
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!loading && !error && countries.length > 0) {
    const countriesDict = countries.reduce((acc, c) => ({ ...acc, [c._id]: c }), {});
    targets = calculateResistanceTargets(regions, countriesDict, countryId, mergedConfig);
  }

  return { countries, coalitions, loading, error, targets };
}
