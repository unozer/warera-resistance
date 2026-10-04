/**
 * Extracts sets of diplomatic friends, enemies, and enemies-of-enemies
 * based on dynamic configuration rules and manual overrides.
 */
export function diplomaticSets(homeId, countriesDict, config = {}) {
    const home = countriesDict[homeId] || {};
    const rules = config.rules || {};
    const manualCountries = config.manualCountries || {};
    const manualCoalitions = config.manualCoalitions || {};

    let friends = new Set();
    let enemies = new Set();
    let eoe = new Set();

    // 1. Automatic Rules
    if (rules.amici_dp !== false) {
        (home.defensivePacts || []).forEach(p => friends.add(p));
    }
    if (rules.amici_coalition !== false && home.allianceId) {
        Object.values(countriesDict).forEach(c => {
            if (c.allianceId === home.allianceId) friends.add(c._id);
        });
    }

    if (rules.nemici_wars !== false) {
        (home.warsWith || []).forEach(w => enemies.add(w));
    }
    if (rules.nemici_ne !== false && home.enemy) {
        enemies.add(home.enemy);
    }

    // EoE based on computed enemies
    enemies.forEach(e => {
        const eCountry = countriesDict[e] || {};
        if (rules.eoe_wars !== false) {
            (eCountry.warsWith || []).forEach(ww => eoe.add(ww));
        }
        if (rules.eoe_ne !== false) {
            Object.values(countriesDict).forEach(c => {
                if (c.enemy === e) eoe.add(c._id);
            });
        }
    });

    // 2. Manual Coalitions
    Object.entries(manualCoalitions).forEach(([coalId, bucket]) => {
        Object.values(countriesDict).forEach(c => {
            if (c.allianceId === coalId) {
                if (bucket === 'alleato' || bucket === 'amico') friends.add(c._id);
                if (bucket === 'nemico') enemies.add(c._id);
                if (bucket === 'nemico comune' || bucket === 'nemico del nemico') eoe.add(c._id);
                if (bucket === 'neutrale') {
                    friends.delete(c._id); enemies.delete(c._id); eoe.delete(c._id);
                }
            }
        });
    });

    // 3. Manual Countries (Highest Precedence)
    Object.entries(manualCountries).forEach(([cId, bucket]) => {
        if (bucket === 'alleato' || bucket === 'amico') { friends.add(cId); enemies.delete(cId); eoe.delete(cId); }
        if (bucket === 'nemico') { enemies.add(cId); friends.delete(cId); eoe.delete(cId); }
        if (bucket === 'nemico comune' || bucket === 'nemico del nemico') { eoe.add(cId); friends.delete(cId); enemies.delete(cId); }
        if (bucket === 'neutrale') { friends.delete(cId); enemies.delete(cId); eoe.delete(cId); }
    });

    // Precedence cleanup
    friends.forEach(f => eoe.delete(f));
    enemies.forEach(e => eoe.delete(e));
    eoe.delete(homeId);
    friends.delete(homeId);
    enemies.delete(homeId);

    return { friends, enemies, eoe };
}

export function getRelationshipLabel(countryId, homeId, { friends, enemies, eoe }, config = {}) {
    if (countryId === homeId) return "casa";
    const manual = config.manualCountries || {};
    if (manual[countryId]) {
        if (manual[countryId] === 'nemico del nemico') return 'nemico comune';
        return manual[countryId];
    }
    
    if (friends.has(countryId)) return "alleato";
    if (enemies.has(countryId)) return "nemico";
    if (eoe.has(countryId)) return "nemico comune";
    return "neutrale";
}

/**
 * Validates if a region should be pushed based on strict inclusion rules.
 */
function isRegionEligible(ownerRel, holderRel, config) {
    if (holderRel === "alleato") return false;
    
    // Hide allied regions held by us (casa) unless explicitly enabled
    if (ownerRel === "alleato" && holderRel === "casa" && config?.rules?.show_allied_held_by_me === false) {
        return false;
    }
    
    if (ownerRel === "nemico" || ownerRel === "casa") return false;
    if (ownerRel === "neutrale" && holderRel !== "nemico") return false;
    if (ownerRel === "nemico comune" && holderRel === "nemico comune") return false;
    return true;
}

function determineTier(ownerRel) {
    if (ownerRel === "alleato") return 1;
    if (ownerRel === "nemico comune") return 2;
    return 3;
}

function determineHoldScore(holderRel) {
    if (holderRel === "nemico") return 0;
    if (holderRel === "nemico comune") return 2;
    return 1;
}

export function calculateResistanceTargets(regionsDict, countriesDict, homeId, config = {}) {
    if (!homeId) return { pushing: [], ready: [], warning: [] };

    const diplomacy = diplomaticSets(homeId, countriesDict, config);
    const occupied = Object.values(regionsDict).filter(
        r => r.country && r.initialCountry && r.country !== r.initialCountry
    );

    const candidates = [];
    occupied.forEach(region => {
        const holderId = region.country;
        const ownerId = region.initialCountry;
        
        const holderRel = getRelationshipLabel(holderId, homeId, diplomacy, config);
        const ownerRel = getRelationshipLabel(ownerId, homeId, diplomacy, config);

        const cur = region.resistance || 0;
        const top = region.resistanceMax || 0;
        
        const isNotFull = cur < top;

        if (isNotFull && isRegionEligible(ownerRel, holderRel, config)) {
            const percent = top > 0 ? ((cur / top) * 100).toFixed(1) : 0;
            candidates.push({
                fascia: determineTier(ownerRel),
                holdScore: determineHoldScore(holderRel),
                regionId: region._id,
                name: region.name,
                manca: Math.round(top - cur),
                percent,
                owner: countriesDict[ownerId]?.name || "Sconosciuto",
                ownerId,
                ownerCode: countriesDict[ownerId]?.code || "",
                ownerRel,
                holder: countriesDict[holderId]?.name || "Sconosciuto",
                holderId,
                holderCode: countriesDict[holderId]?.code || "",
                holderRel,
                full: cur >= top,
            });
        }
    });

    candidates.sort((a, b) => {
        if (a.fascia !== b.fascia) return a.fascia - b.fascia;
        if (a.holdScore !== b.holdScore) return a.holdScore - b.holdScore;
        return a.manca - b.manca;
    });
    
    return { pushing: candidates, ready: [], warning: [] };
}
