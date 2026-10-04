/**
 * Extracts friends, enemies, and enemies of enemies for a given country.
 */
export function diplomaticSets(homeId, countriesDict) {
    const home = countriesDict[homeId] || {};
    const bloc = home.allianceId;

    const friends = new Set(home.allies || []);
    (home.defensivePacts || []).forEach(p => friends.add(p));
    
    if (bloc) {
        Object.values(countriesDict).forEach(c => {
            if (c.allianceId === bloc) friends.add(c._id);
        });
    }
    friends.delete(homeId);

    const rawEnemies = new Set(home.warsWith || []);
    if (home.enemy) rawEnemies.add(home.enemy);
    
    const enemies = new Set();
    rawEnemies.forEach(e => {
        if (!friends.has(e) && e !== homeId) enemies.add(e);
    });

    const eoe = new Set();
    enemies.forEach(e => {
        const eCountry = countriesDict[e] || {};
        (eCountry.warsWith || []).forEach(ww => eoe.add(ww));
        Object.values(countriesDict).forEach(c => {
            if (c.enemy === e) eoe.add(c._id);
        });
    });

    friends.forEach(f => eoe.delete(f));
    enemies.forEach(e => eoe.delete(e));
    eoe.delete(homeId);

    return { friends, enemies, eoe };
}

/**
 * Determines the diplomatic relationship label.
 */
export function getRelationshipLabel(countryId, homeId, { friends, enemies, eoe }) {
    if (countryId === homeId) return "casa";
    if (friends.has(countryId)) return "amico";
    if (enemies.has(countryId)) return "nemico";
    if (eoe.has(countryId)) return "nemico del nemico";
    return "neutrale";
}

/**
 * Determines the tier (fascia) for a target based on who owns the region.
 * 1: Friends
 * 2: Enemies of Enemies
 * 3: Neutrals
 */
function determineTier(ownerRel) {
    if (ownerRel === "amico") return 1;
    if (ownerRel === "nemico del nemico") return 2;
    return 3; // Neutral
}

/**
 * Determines a secondary priority score based on who currently holds the region.
 * We prioritize freeing regions from enemies (0) over neutral/allies.
 */
function determineHoldScore(holderRel) {
    if (holderRel === "nemico") return 0;
    if (holderRel === "nemico del nemico") return 2;
    return 1;
}

/**
 * Validates if a region should be pushed based on strict inclusion rules.
 */
function isRegionEligible(ownerRel, holderRel) {
    if (holderRel === "amico") return false;
    if (ownerRel === "nemico" || ownerRel === "casa") return false;
    if (ownerRel === "neutrale" && holderRel !== "nemico") return false;
    if (ownerRel === "nemico del nemico" && holderRel === "nemico del nemico") return false;
    return true;
}

/**
 * Calculates strategic targets (pushing, ready, warning) for the resistance.
 */
export function calculateResistanceTargets(regionsDict, countriesDict, homeId) {
    if (!homeId) return { pushing: [], ready: [], warning: [] };

    const diplomacy = diplomaticSets(homeId, countriesDict);
    const occupied = Object.values(regionsDict).filter(
        r => r.country && r.initialCountry && r.country !== r.initialCountry
    );

    const warning = [];
    const candidates = [];

    occupied.forEach(region => {
        const holderId = region.country;
        const ownerId = region.initialCountry;
        
        const holderRel = getRelationshipLabel(holderId, homeId, diplomacy);
        const ownerRel = getRelationshipLabel(ownerId, homeId, diplomacy);

        const cur = region.resistance || 0;
        const top = region.resistanceMax || 0;
        const percent = top ? Math.floor((1000 * cur / top)) / 10 : 0;

        if (holderId === homeId) {
            warning.push({
                regionId: region._id,
                name: region.name,
                percent: top ? Math.round((100 * cur / top) * 10) / 10 : 0,
                owner: countriesDict[ownerId]?.name || "Sconosciuto",
                ownerRel
            });
            return;
        }

        if (!isRegionEligible(ownerRel, holderRel)) return;

        candidates.push({
            fascia: determineTier(ownerRel),
            regionId: region._id,
            name: region.name,
            manca: Math.round(top - cur),
            percent,
            owner: countriesDict[ownerId]?.name || "Sconosciuto",
            ownerCode: countriesDict[ownerId]?.code || "",
            ownerRel,
            holder: countriesDict[holderId]?.name || "Sconosciuto",
            holderCode: countriesDict[holderId]?.code || "",
            holderRel,
            full: cur >= top,
            holdScore: determineHoldScore(holderRel),
            lastContribution: region.lastResistanceContributionAt
        });
    });

    candidates.sort((a, b) => {
        if (a.fascia !== b.fascia) return a.fascia - b.fascia;
        if (a.holdScore !== b.holdScore) return a.holdScore - b.holdScore;
        return a.manca - b.manca;
    });

    return {
        pushing: candidates.filter(c => !c.full),
        ready: candidates.filter(c => c.full),
        warning: warning.sort((a, b) => b.percent - a.percent)
    };
}
