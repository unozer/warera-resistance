import { useState, useEffect } from 'react';
import { fetchCountries, fetchRegions } from '../api';
import { calculateResistanceTargets } from '../logic';

export function useWareraData(countryId) {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  let targets = { pushing: [] };
  if (!loading && !error && countries.length > 0) {
    const countriesDict = countries.reduce((acc, c) => ({ ...acc, [c._id]: c }), {});
    targets = calculateResistanceTargets(regions, countriesDict, countryId);
  }

  return { countries, loading, error, targets };
}
