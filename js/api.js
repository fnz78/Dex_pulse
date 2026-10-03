/* ============================================================
   DEXPULSE API SERVICE & DATA FETCHING
   ============================================================ */

window.DexAPI = (function () {
  const API_BASE = 'https://pokeapi.co/api/v2';
  const cache = {};

  // Generation boundaries mapping
  const genRanges = {
    1: { min: 1, max: 151, name: 'Gen I (Kanto)' },
    2: { min: 152, max: 251, name: 'Gen II (Johto)' },
    3: { min: 252, max: 386, name: 'Gen III (Hoenn)' },
    4: { min: 387, max: 493, name: 'Gen IV (Sinnoh)' },
    5: { min: 494, max: 649, name: 'Gen V (Unova)' },
    6: { min: 650, max: 721, name: 'Gen VI (Kalos)' },
    7: { min: 722, max: 809, name: 'Gen VII (Alola)' },
    8: { min: 810, max: 905, name: 'Gen VIII (Galar)' },
    9: { min: 906, max: 1025, name: 'Gen IX (Paldea)' }
  };

  async function fetchJSON(url) {
    if (cache[url]) return cache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache[url] = data;
    return data;
  }

  // Pre-fetch complete list of Pokémon names & IDs for search autocomplete
  async function prefetchAutocompleteList() {
    try {
      const data = await fetchJSON(`${API_BASE}/pokemon?limit=1025&offset=0`);
      if (data && data.results) {
        window.DexState.allPokemonNames = data.results.map((p, idx) => ({
          id: idx + 1,
          name: p.name
        }));
        return window.DexState.allPokemonNames;
      }
    } catch (e) {
      console.warn('Failed to pre-fetch autocomplete list:', e);
    }
    return [];
  }

  async function getPokemon(idOrName) {
    const key = String(idOrName).toLowerCase().trim();
    const pokeData = await fetchJSON(`${API_BASE}/pokemon/${key}`);
    const speciesData = await fetchJSON(pokeData.species.url);

    // Build forms list
    const forms = speciesData.varieties.map(v => ({
      name: v.pokemon.name,
      label: buildFormLabel(v.pokemon.name, speciesData.name),
      url: v.pokemon.url,
      isDefault: v.is_default
    }));

    // Check if female sprite exists
    const hasFemale = Boolean(
      pokeData.sprites.front_female ||
      pokeData.sprites.other?.['official-artwork']?.front_female ||
      pokeData.sprites.other?.home?.front_female
    );

    return { pokeData, speciesData, forms, hasFemale };
  }

  async function getEvolutionChain(url) {
    return await fetchJSON(url);
  }

  function buildFormLabel(fullName, baseName) {
    if (fullName === baseName) return 'Base';
    const suffix = fullName.replace(baseName + '-', '');
    const map = {
      alola: 'Alolan', galar: 'Galarian', hisui: 'Hisuian', paldea: 'Paldean',
      mega: 'Mega', 'mega-x': 'Mega X', 'mega-y': 'Mega Y',
      gmax: 'G-Max', eternamax: 'Eternamax',
      'original-cap': 'Orig. Cap', 'hoenn-cap': 'Hoenn Cap',
      hero: 'Hero', crowned: 'Crowned', school: 'School',
      attack: 'Attack', defense: 'Defense', speed: 'Speed',
      blade: 'Blade', dawn: 'Dawn', midday: 'Midday', midnight: 'Midnight',
      dusk: 'Dusk', ice: 'Ice', shadow: 'Shadow', origin: 'Origin',
      altered: 'Altered', sky: 'Sky', therian: 'Therian', black: 'Black', white: 'White',
      ordinary: 'Ordinary', resolute: 'Resolute'
    };
    return map[suffix] || capitalize(suffix);
  }

  function capitalize(s) {
    return s ? s.replace(/-/g, ' ').replace(/\b./g, c => c.toUpperCase()) : '';
  }

  return {
    getPokemon,
    getEvolutionChain,
    prefetchAutocompleteList,
    fetchJSON,
    genRanges,
    capitalize
  };
})();
