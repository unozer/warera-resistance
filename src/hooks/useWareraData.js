import { useState, useEffect } from 'react';
import { fetchCountries, fetchRegions, fetchCoalitions } from '../api';
import { calculateResistanceTargets } from '../logic';

const DEFAULT_CONFIG = {
  rules: {
    amici_allies: true,
    amici_dp: true,
    amici_coalition: true,
    nemici_wars: true,
    nemici_ne: true,
    eoe_wars: true,
    eoe_ne: true
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
        const [cList, rDict, coalDict] = await Promise.all([
          fetchCountries(), 
          fetchRegions(),
          fetchCoalitions()
        ]);
        
        cList.sort((a, b) => a.name.localeCompare(b.name));
        
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
