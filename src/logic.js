export function diplomaticSets(homeId, countriesDict) {
    const home = countriesDict[homeId] || {};
    const bloc = home.allianceId;

    let friends = new Set(home.allies || []);
    (home.defensivePacts || []).forEach(p => friends.add(p));
    
    if (bloc) {
        Object.values(countriesDict).forEach(c => {
            if (c.allianceId === bloc) friends.add(c._id);
        });
    }
    friends.delete(homeId);

    let rawEnemies = new Set(home.warsWith || []);
    if (home.enemy) rawEnemies.add(home.enemy);
    
    let enemies = new Set();
    rawEnemies.forEach(e => {
        if (!friends.has(e) && e !== homeId) enemies.add(e);
    });

    let eoe = new Set();
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

function relLabel(cid, homeId, friends, enemies, eoe) {
    if (cid === homeId) return "casa";
    if (friends.has(cid)) return "amico";
    if (enemies.has(cid)) return "nemico";
    if (eoe.has(cid)) return "nemico del nemico";
    return "neutrale";
}

export function calculateResistanceTargets(regionsDict, countriesDict, homeId) {
    if (!homeId) return { pushing: [], ready: [], warning: [] };

    const { friends, enemies, eoe } = diplomaticSets(homeId, countriesDict);
    const occupied = Object.values(regionsDict).filter(r => r.country && r.initialCountry && r.country !== r.initialCountry);

    let warning = [];
    let candidates = [];

    occupied.forEach(r => {
        const top = r.resistanceMax || 0;
        const cur = r.resistance || 0;
        const holderId = r.country;
        const ownerId = r.initialCountry;

        const rh = relLabel(holderId, homeId, friends, enemies, eoe);
        const ro = relLabel(ownerId, homeId, friends, enemies, eoe);

        if (holderId === homeId) {
            warning.push({
                regionId: r._id,
                name: r.name,
                percent: top ? Math.round((100 * cur / top) * 10) / 10 : 0,
                owner: (countriesDict[ownerId] || {}).name,
                ownerRel: ro
            });
            return;
        }

        if (rh === "amico") return;
        if (ro === "nemico" || ro === "casa") return;
        if (ro === "neutrale" && rh !== "nemico") return;
        if (ro === "nemico del nemico" && rh === "nemico del nemico") return;

        let fascia = 3;
        if (ro === "amico") fascia = 1;
        else if (ro === "nemico del nemico") fascia = 2;

        let holdScore = 1;
        if (rh === "nemico") holdScore = 0;
        else if (rh === "nemico del nemico") holdScore = 2;

        const manca = Math.round(top - cur);

        candidates.push({
            fascia,
            regionId: r._id,
            name: r.name,
            manca,
            percent: top ? Math.floor((1000 * cur / top)) / 10 : 0,
            owner: (countriesDict[ownerId] || {}).name,
            ownerRel: ro,
            holder: (countriesDict[holderId] || {}).name,
            holderRel: rh,
            full: cur >= top,
            holdScore,
            lastContribution: r.lastResistanceContributionAt
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
