/* ============================================================
   DEXPULSE MAIN APPLICATION ENTRY POINT & EVENT LISTENERS
   ============================================================ */

window.DexApp = (function () {
  const $ = id => document.getElementById(id);

  async function init() {
    setupEventListeners();
    
    // 1. Update preloader
    window.DexSkeleton.updatePreloaderProgress(25, 'PRE-FETCHING CREATURE INDEX DATABASE…');

    // 2. Pre-fetch autocomplete list
    const autocompleteList = await window.DexAPI.prefetchAutocompleteList();
    populateAutocompleteDatalist(autocompleteList);
    
    window.DexSkeleton.updatePreloaderProgress(65, 'BUILDING MULTI-GENERATION ROSTER GRID…');

    // 3. Initialize roster grid data
    window.DexGrid.initRoster();

    window.DexSkeleton.updatePreloaderProgress(85, 'LOADING FEATURED CREATURE DOSSIER…');

    // 4. Load initial Pokémon (Pikachu #25)
    await loadPokemon(25);

    // 5. Hide preloader
    window.DexSkeleton.hidePreloader();
  }

  async function loadPokemon(idOrName) {
    const state = window.DexState;
    window.DexSkeleton.setPanelLoading(true);

    try {
      const { pokeData, speciesData, forms } = await window.DexAPI.getPokemon(idOrName);

      state.currentId = pokeData.id;
      state.currentPokeData = pokeData;
      state.currentSpeciesData = speciesData;
      state.currentForms = forms;
      state.activeFormIndex = forms.findIndex(f => f.name === pokeData.name);
      if (state.activeFormIndex === -1) state.activeFormIndex = 0;

      window.DexUI.renderPokemon(pokeData, speciesData);

      window.DexUI.renderFormSelector(forms, state.activeFormIndex, (idx) => {
        loadForm(idx);
      });

      // Evolution Chain
      if (speciesData.evolution_chain?.url) {
        const evoData = await window.DexAPI.getEvolutionChain(speciesData.evolution_chain.url);
        window.DexUI.renderEvoChain(evoData, pokeData.id, (pokeId) => {
          loadPokemon(pokeId);
        });
      }

    } catch (e) {
      console.error(e);
      showToast('Pokémon not found in database!');
    } finally {
      window.DexSkeleton.setPanelLoading(false);
    }
  }

  async function loadForm(idx) {
    const state = window.DexState;
    state.activeFormIndex = idx;
    const form = state.currentForms[idx];
    if (!form) return;

    window.DexSkeleton.setPanelLoading(true);
    try {
      const formData = await window.DexAPI.fetchJSON(form.url);
      const speciesData = await window.DexAPI.fetchJSON(formData.species.url);
      state.currentPokeData = formData;
      window.DexUI.renderPokemon(formData, speciesData);
      window.DexUI.renderFormSelector(state.currentForms, idx, (i) => loadForm(i));
      ballFlipAnim();
    } catch (e) {
      showToast('Form data unavailable.');
    } finally {
      window.DexSkeleton.setPanelLoading(false);
    }
  }

  function setupEventListeners() {
    const state = window.DexState;

    // Search
    const searchInput = $('searchInput');
    const searchBtn = $('searchBtn');

    function executeSearch() {
      const val = searchInput.value.trim();
      if (!val) return;

      if (state.viewMode === 'grid') {
        state.rosterSearchQuery = val;
        window.DexGrid.renderFilteredRoster();
      } else {
        const num = parseInt(val, 10);
        loadPokemon(isNaN(num) ? val : num);
        searchInput.value = '';
        searchInput.blur();
      }
    }

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') executeSearch();
      });
      searchInput.addEventListener('change', e => {
        // Execute search on datalist selection
        if (e.target.value.trim() && state.viewMode !== 'grid') {
          executeSearch();
        }
      });
      searchInput.addEventListener('input', e => {
        if (state.viewMode === 'grid') {
          state.rosterSearchQuery = e.target.value;
          window.DexGrid.renderFilteredRoster();
        }
      });
    }

    // Navigation Arrows
    const prevBtn = $('prevBtn');
    const nextBtn = $('nextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentId > 1) {
          loadPokemon(state.currentId - 1);
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentId < 1025) {
          loadPokemon(state.currentId + 1);
        }
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => {
      if (e.target === searchInput || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (state.viewMode === 'detail') {
        if (e.key === 'ArrowLeft' && state.currentId > 1) {
          loadPokemon(state.currentId - 1);
        } else if (e.key === 'ArrowRight' && state.currentId < 1025) {
          loadPokemon(state.currentId + 1);
        }
      }
    });

    // Shiny Toggle
    const shinyBtn = $('shinyBtn');
    if (shinyBtn) {
      shinyBtn.addEventListener('click', () => {
        state.isShiny = !state.isShiny;
        shinyBtn.classList.toggle('active', state.isShiny);
        const label = $('shinyLabel');
        if (label) {
          label.textContent = state.isShiny ? 'Shiny ✦' : 'Normal';
          label.classList.toggle('active', state.isShiny);
        }
        if (state.currentPokeData) {
          window.DexUI.updateSprite(state.currentPokeData);
        }
        ballFlipAnim();
      });
    }

    // Gender Toggle
    const genderBtn = $('genderBtn');
    if (genderBtn) {
      genderBtn.addEventListener('click', () => {
        if (!state.hasFemaleSprite) return;
        state.gender = state.gender === 'male' ? 'female' : 'male';
        window.DexUI.updateGenderBtnUI();
        if (state.currentPokeData) {
          window.DexUI.updateSprite(state.currentPokeData);
        }
        ballFlipAnim();
      });
    }

    // View Mode Toggle (Detail vs Grid)
    const btnDetailView = $('btnDetailView');
    const btnGridView = $('btnGridView');

    if (btnDetailView) {
      btnDetailView.addEventListener('click', () => switchView('detail'));
    }
    if (btnGridView) {
      btnGridView.addEventListener('click', () => switchView('grid'));
    }

    // Stat Chart Mode Toggle (Radar vs Bars)
    const btnRadarChart = $('btnRadarChart');
    const btnStatBars = $('btnStatBars');

    if (btnRadarChart && btnStatBars) {
      btnRadarChart.addEventListener('click', () => setStatChartMode('radar'));
      btnStatBars.addEventListener('click', () => setStatChartMode('bars'));
    }

    // Grid Filters & Sort
    const selectGen = $('selectGen');
    const selectSort = $('selectSort');
    const loadMoreBtn = $('loadMoreBtn');

    if (selectGen) {
      selectGen.addEventListener('change', e => {
        state.rosterGen = parseInt(e.target.value, 10);
        window.DexGrid.renderFilteredRoster();
      });
    }
    if (selectSort) {
      selectSort.addEventListener('change', e => {
        state.rosterSort = e.target.value;
        window.DexGrid.renderFilteredRoster();
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => window.DexGrid.loadMore());
    }

    // Filter Modal Setup
    setupFilterModal();
  }

  function setupFilterModal() {
    const filterBtnTrigger = $('filterBtnTrigger');
    const modalOverlay = $('filterModalOverlay');
    const modalClose = $('modalClose');
    const modalBtnReset = $('modalBtnReset');
    const modalBtnApply = $('modalBtnApply');
    const state = window.DexState;

    if (filterBtnTrigger && modalOverlay) {
      filterBtnTrigger.addEventListener('click', () => {
        modalOverlay.classList.add('open');
      });
    }

    if (modalClose && modalOverlay) {
      modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('open');
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('open');
      });
    }

    // Gen Chips in Modal
    const genChips = document.querySelectorAll('.gen-chip');
    genChips.forEach(chip => {
      chip.addEventListener('click', () => {
        genChips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const genVal = parseInt(chip.dataset.gen, 10);
        state.rosterGen = genVal;
        const selectGen = $('selectGen');
        if (selectGen) selectGen.value = genVal;
      });
    });

    if (modalBtnReset) {
      modalBtnReset.addEventListener('click', () => {
        state.rosterGen = 0;
        state.rosterSearchQuery = '';
        const selectGen = $('selectGen');
        if (selectGen) selectGen.value = 0;
        genChips.forEach(c => c.classList.remove('selected'));
        if (genChips[0]) genChips[0].classList.add('selected');
        window.DexGrid.renderFilteredRoster();
        if (modalOverlay) modalOverlay.classList.remove('open');
      });
    }

    if (modalBtnApply) {
      modalBtnApply.addEventListener('click', () => {
        window.DexGrid.renderFilteredRoster();
        if (modalOverlay) modalOverlay.classList.remove('open');
      });
    }
  }

  function switchView(mode) {
    const state = window.DexState;
    state.viewMode = mode;

    const detailSection = $('detailViewSection');
    const gridSection = $('gridViewSection');
    const btnDetailView = $('btnDetailView');
    const btnGridView = $('btnGridView');

    if (mode === 'grid') {
      if (detailSection) detailSection.classList.add('hidden');
      if (gridSection) gridSection.classList.remove('hidden');
      if (btnDetailView) btnDetailView.classList.remove('active');
      if (btnGridView) btnGridView.classList.add('active');
      window.DexGrid.renderFilteredRoster();
    } else {
      if (gridSection) gridSection.classList.add('hidden');
      if (detailSection) detailSection.classList.remove('hidden');
      if (btnGridView) btnGridView.classList.remove('active');
      if (btnDetailView) btnDetailView.classList.add('active');
    }
  }

  function setStatChartMode(mode) {
    const state = window.DexState;
    state.chartMode = mode;

    const btnRadarChart = $('btnRadarChart');
    const btnStatBars = $('btnStatBars');

    if (btnRadarChart) btnRadarChart.classList.toggle('active', mode === 'radar');
    if (btnStatBars) btnStatBars.classList.toggle('active', mode === 'bars');

    if (state.currentPokeData) {
      window.DexUI.renderPokemon(state.currentPokeData, state.currentSpeciesData);
    }
  }

  function populateAutocompleteDatalist(list) {
    const datalist = $('pokemonDatalist');
    if (!datalist || !list) return;
    datalist.innerHTML = '';
    list.forEach(p => {
      const opt = document.createElement('option');
      opt.value = window.DexAPI.capitalize(p.name);
      datalist.appendChild(opt);
    });
  }

  function ballFlipAnim() {
    const ballBg = $('ballBg');
    if (!ballBg) return;
    ballBg.classList.remove('flip-anim');
    void ballBg.offsetWidth;
    ballBg.classList.add('flip-anim');
    setTimeout(() => ballBg.classList.remove('flip-anim'), 800);
  }

  function showToast(msg) {
    const toast = $('errorToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  return {
    init,
    loadPokemon,
    switchView,
    showToast
  };
})();

// Launch application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.DexApp.init();
});
