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
    if (rules.amici_allies !== false) {
        (home.allies || []).forEach(p => friends.add(p));
    }
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
                if (bucket === 'amico') friends.add(c._id);
                if (bucket === 'nemico') enemies.add(c._id);
                if (bucket === 'nemico del nemico') eoe.add(c._id);
                if (bucket === 'neutrale') {
                    friends.delete(c._id); enemies.delete(c._id); eoe.delete(c._id);
                }
            }
        });
    });

    // 3. Manual Countries (Highest Precedence)
    Object.entries(manualCountries).forEach(([cId, bucket]) => {
        if (bucket === 'amico') { friends.add(cId); enemies.delete(cId); eoe.delete(cId); }
        if (bucket === 'nemico') { enemies.add(cId); friends.delete(cId); eoe.delete(cId); }
        if (bucket === 'nemico del nemico') { eoe.add(cId); friends.delete(cId); enemies.delete(cId); }
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
    if (manual[countryId]) return manual[countryId];
    
    if (friends.has(countryId)) return "amico";
    if (enemies.has(countryId)) return "nemico";
    if (eoe.has(countryId)) return "nemico del nemico";
    return "neutrale";
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
        
        // Push only if: owner is amico AND holder is nemico (or nemico del nemico)
        const isPushable = ownerRel === "amico" && (holderRel === "nemico" || holderRel === "nemico del nemico");
        const isNotFull = cur < top;

        if (isPushable && isNotFull) {
            const percent = top > 0 ? ((cur / top) * 100).toFixed(1) : 0;
            candidates.push({
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

    candidates.sort((a, b) => a.manca - b.manca);
    return { pushing: candidates, ready: [], warning: [] };
}
