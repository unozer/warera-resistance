const CACHE_TTL = {
  COUNTRIES: 1000 * 60 * 60 * 24, // 24 hours
  COALITIONS: 1000 * 60 * 60 * 24, // 24 hours
  REGIONS: 1000 * 30, // 30 seconds
};

async function fetchWithCache(url, key, ttl) {
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Session storage error ignored", e);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore API per ${key}`);
  
  const json = await res.json();
  const data = json?.result?.data || (Array.isArray(json?.result?.data) ? [] : {});
  
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn("Session storage write error ignored", e);
  }

  return data;
}

export const fetchCountries = async () => {
  const data = await fetchWithCache('https://api2.warera.io/trpc/country.getAllCountries', 'warera_countries', CACHE_TTL.COUNTRIES);
  return Array.isArray(data) ? data : [];
};

export const fetchRegions = async () => {
  const data = await fetchWithCache('https://api2.warera.io/trpc/region.getRegionsObject', 'warera_regions', CACHE_TTL.REGIONS);
  return data || {};
};
