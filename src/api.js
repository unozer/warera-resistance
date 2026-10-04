export const fetchCountries = async () => {
  const res = await fetch('https://api2.warera.io/trpc/country.getAllCountries');
  if (!res.ok) throw new Error("Errore fetch nazioni");
  const data = await res.json();
  return data?.result?.data || [];
};

export const fetchRegions = async () => {
  const res = await fetch('https://api2.warera.io/trpc/region.getRegionsObject');
  if (!res.ok) throw new Error("Errore fetch regioni");
  const data = await res.json();
  return data?.result?.data || {};
};
