/* ============================================================
   DEXPULSE GLOBAL APPLICATION STATE
   ============================================================ */

window.DexState = {
  currentId: 25,
  currentPokeData: null,
  currentSpeciesData: null,
  currentForms: [],
  activeFormIndex: 0,
  isShiny: false,
  gender: 'male', // 'male' | 'female'
  hasFemaleSprite: false,
  viewMode: 'detail', // 'detail' | 'grid'
  chartMode: 'radar', // 'radar' | 'bars'
  
  // Roster / Grid View State
  rosterGen: 0, // 0 = All Generations, 1-9 = Gen 1 to 9
  rosterType: 'all',
  rosterSort: 'id-asc', // 'id-asc', 'id-desc', 'name-asc', 'bst-desc', 'bst-asc'
  rosterSearchQuery: '',
  rosterOffset: 0,
  rosterLimit: 30,
  filteredRoster: [],

  // Pre-fetched autocomplete list
  allPokemonNames: []
};
