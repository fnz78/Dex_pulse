/* ============================================================
   DEXPULSE ROSTER GRID VIEW & FILTER SYSTEM
   ============================================================ */

window.DexGrid = (function () {
  let rosterData = [];

  function initRoster() {
    // Generate initial roster list from pre-fetched name list
    renderFilteredRoster();
  }

  function applyFiltersAndSort() {
    const state = window.DexState;
    const namesList = state.allPokemonNames;

    if (!namesList || namesList.length === 0) return;

    let filtered = [...namesList];

    // Filter by Generation
    if (state.rosterGen > 0) {
      const range = window.DexAPI.genRanges[state.rosterGen];
      if (range) {
        filtered = filtered.filter(p => p.id >= range.min && p.id <= range.max);
      }
    }

    // Filter by Search Query
    if (state.rosterSearchQuery) {
      const q = state.rosterSearchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.includes(q) || String(p.id) === q);
    }

    // Sort
    if (state.rosterSort === 'id-asc') {
      filtered.sort((a, b) => a.id - b.id);
    } else if (state.rosterSort === 'id-desc') {
      filtered.sort((a, b) => b.id - a.id);
    } else if (state.rosterSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    state.filteredRoster = filtered;
    state.rosterOffset = 0;
  }

  function renderFilteredRoster(append = false) {
    applyFiltersAndSort();
    const state = window.DexState;
    const gridContainer = document.getElementById('pokemonGrid');
    const countBadge = document.getElementById('rosterCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!gridContainer) return;

    if (!append) {
      gridContainer.innerHTML = '';
    }

    if (countBadge) {
      countBadge.textContent = `${state.filteredRoster.length} Pokémon`;
    }

    const itemsToLoad = state.filteredRoster.slice(state.rosterOffset, state.rosterOffset + state.rosterLimit);

    itemsToLoad.forEach(poke => {
      const card = createPokemonCard(poke);
      gridContainer.appendChild(card);
    });

    state.rosterOffset += state.rosterLimit;

    if (loadMoreBtn) {
      if (state.rosterOffset >= state.filteredRoster.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }
    }
  }

  function createPokemonCard(poke) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.setAttribute('data-id', poke.id);

    const formattedId = `#${String(poke.id).padStart(4, '0')}`;
    const nameFormatted = window.DexAPI.capitalize(poke.name);
    // Official artwork standard URL
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`;

    card.innerHTML = `
      <span class="card-num">${formattedId}</span>
      <div class="card-sprite-wrap">
        <img src="${spriteUrl}" alt="${poke.name}" loading="lazy" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png'"/>
      </div>
      <div class="card-name">${nameFormatted}</div>
    `;

    card.addEventListener('click', () => {
      window.DexApp.switchView('detail');
      window.DexApp.loadPokemon(poke.id);
    });

    return card;
  }

  function loadMore() {
    renderFilteredRoster(true);
  }

  return {
    initRoster,
    renderFilteredRoster,
    loadMore
  };
})();
