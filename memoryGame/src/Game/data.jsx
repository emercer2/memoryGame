import keeby from "../assets/Keeby.jpg";
import kirby from "../assets/Kirby.jpg";
import UFO from "../assets/UFO.jpg";
import Gordo from "../assets/Gordo.jpg";
import waddledoo from "../assets/Waddledoo.jpg";
import squishy from "../assets/Squishy.jpg";

// all the kirby images
const kirbyData = [
    { id: 1, name: "Kirby", img: kirby, matched: false },
    { id: 2, name: "Keeby", img: keeby, matched: false },
    { id: 3, name: "UFO", img: UFO, matched: false },
    { id: 4, name: "Gordo", img: Gordo, matched: false },
    { id: 5, name: "Waddledoo", img: waddledoo, matched: false },
    { id: 6, name: "Squishy", img: squishy, matched: false },
    // duplicates for pairs
    { id: 7, name: "Kirby", img: kirby, matched: false },
    { id: 8, name: "Keeby", img: keeby, matched: false },
    { id: 9, name: "UFO", img: UFO, matched: false },
    { id: 10, name: "Gordo", img: Gordo, matched: false },
    { id: 11, name: "Waddledoo", img: waddledoo, matched: false },
    { id: 12, name: "Squishy", img: squishy, matched: false },
];

let acData = [];

// add sanitizer + placeholder
const PLACEHOLDER_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
function sanitizeImageUrl(url) {
    if (!url) return PLACEHOLDER_IMG;
    url = String(url).trim();

    // already a data URI
    if (url.startsWith('data:')) return url;

    // protocol-relative -> https
    if (url.startsWith('//')) return 'https:' + url;

    // upgrade http to https to avoid mixed-content issues
    if (url.startsWith('http:')) return url.replace(/^http:/, 'https:');

    // relative paths (starting with '/') are fine for local assets
    if (url.startsWith('/')) return url;

    // otherwise return as-is (may be a valid absolute URL)
    return url;
}

// --- new helper: preload images and log load/error ---
function preloadImages(cards = []) {
    if (!cards || !cards.length) return;
    cards.forEach(card => {
        if (!card || !card.img) {
            console.warn('[Data] preloadImages - missing img for', card && card.name, card && card.id);
            return;
        }
        try {
            const img = new Image();
            img.onerror = () => console.error('[Data] image failed to load', { name: card.name, id: card.id, src: card.img });
            // assign src after handlers
            img.src = card.img;
        } catch (e) {
            console.error('[Data] preloadImages error', e, card && card.img);
        }
    });
}
// -----------------------------------------------------------------

/**
 * Fetch data for the game.
 * isAC - whether to use Animal Crossing data
 * optionsOrForce=false - optional options object or boolean force refresh
 *    If a boolean is passed it is treated as forceRefresh. Otherwise pass { forceRefresh: true }.
 */
async function Data(isAC, optionsOrForce = false) {
    // support calling Data(isAC, true) for force refresh
    const forceRefresh = typeof optionsOrForce === 'boolean' ? optionsOrForce : (optionsOrForce && optionsOrForce.forceRefresh);

    if (!isAC) {
        return kirbyData;
    } 
    // if cached and not forced, return cached
    if (acData.length === 12 && !forceRefresh) {
        return acData;
    }

    // use env var for the Nookipedia API key (Create React App uses REACT_APP_ prefix)
    const API_KEY = import.meta.env.VITE_APP_NOOKIPEDIA_API_KEY;
    if (!API_KEY) {
        console.warn('Nookipedia API key not found (check REACT_APP_NOOKIPEDIA_API_KEY or VITE_NOOKIPEDIA_API_KEY). Fetch may fail.');
    }

    try {
        const headers = API_KEY ? { 'X-API-KEY': API_KEY } : {};
        const res = await fetch('https://api.nookipedia.com/villagers', {
            method: 'GET',
            headers
        });

        // explicit error handling for auth and other failures
        if (res.status === 401) {
            console.error('Nookipedia API returned 401 Unauthorized. Verify your API key is present and valid.');
            console.error('Check that you set REACT_APP_NOOKIPEDIA_API_KEY (CRA) or VITE_NOOKIPEDIA_API_KEY (Vite) in .env and restarted the dev server.');
            return acData;
        }
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(`Nookipedia fetch failed: ${res.status} ${res.statusText}`, text);
            return acData;
        }

        const json = await res.json();

        // json might be an object with a data property or already an array
        const villagers = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);

        if (!villagers.length) {
            console.warn('No villagers returned from API:', json);
            return acData;
        }

        // pick 6 random villagers
        const selectedVillagers = villagers.sort(() => 0.5 - Math.random()).slice(0, 6);

        // build paired cards with deterministic unique ids 1..12
        const newAcData = [];
        selectedVillagers.forEach((villager, i) => {
            // prefer common fields, then sanitize
            const rawImg = villager.image_url || villager.icon_uri || villager.image || '';
            const img = sanitizeImageUrl(rawImg);
            const baseId = i * 2 + 1;
            newAcData.push({
                id: baseId,
                name: villager.name,
                img,
                matched: false,
            });
            newAcData.push({
                id: baseId + 1,
                name: villager.name,
                img,
                matched: false,
            });
        });

        // shuffle final array so pairs aren't adjacent
        for (let i = newAcData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newAcData[i], newAcData[j]] = [newAcData[j], newAcData[i]];
        }

        acData = newAcData;
        // preload AC images to ensure they load and surface errors
        preloadImages(acData.slice(0,6));
        return acData;
    } catch (err) {
        console.error('Error fetching villagers:', err);
        return acData;
    }        
}

// helper to force a refresh of AC data (useful when starting a new AC game)
async function refreshACData() {
    return Data(true, { forceRefresh: true });
}

export { refreshACData };
export default Data;