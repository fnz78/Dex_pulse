/* ============================================================
   DEXPULSE UI RENDERING & COMPONENT CONTROLLER
   ============================================================ */

window.DexUI = (function () {
  const $ = id => document.getElementById(id);

  function renderPokemon(pokeData, speciesData) {
    const state = window.DexState;

    // 1. Identity & Name
    const nameEl = $('pokeName');
    if (nameEl) {
      nameEl.classList.remove('fade-in');
      nameEl.classList.add('fade-out');
      setTimeout(() => {
        nameEl.textContent = window.DexAPI.capitalize(pokeData.name);
        nameEl.classList.remove('fade-out');
        nameEl.classList.add('fade-in');
        nameEl.classList.add('glitch-anim');
        setTimeout(() => nameEl.classList.remove('glitch-anim'), 500);
      }, 150);
    }

    if ($('pokeId')) $('pokeId').textContent = `NO. ${String(pokeData.id).padStart(4, '0')}`;
    if ($('dexNumBadge')) $('dexNumBadge').textContent = `#${String(pokeData.id).padStart(3, '0')}`;

    // 2. Types Badges
    const typesRow = $('typesRow');
    if (typesRow) {
      typesRow.innerHTML = '';
      pokeData.types.forEach(t => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${t.type.name}`;
        badge.textContent = t.type.name.toUpperCase();
        typesRow.appendChild(badge);
      });
    }

    // 3. Gender Toggle Check
    const genderBtn = $('genderBtn');
    const hasFemale = Boolean(
      pokeData.sprites.front_female ||
      pokeData.sprites.other?.['official-artwork']?.front_female ||
      pokeData.sprites.other?.home?.front_female
    );
    state.hasFemaleSprite = hasFemale;

    if (genderBtn) {
      if (!hasFemale) {
        genderBtn.disabled = true;
        genderBtn.title = "No distinct female visual form in API";
        genderBtn.className = "gender-btn";
        genderBtn.innerHTML = `<span>♂/♀</span> Standard`;
        state.gender = 'male';
      } else {
        genderBtn.disabled = false;
        genderBtn.title = "Switch Gender Sprite (Male / Female)";
        updateGenderBtnUI();
      }
    }

    // 4. Update Sprite
    updateSprite(pokeData);

    // 5. Abilities
    const abilityList = $('abilityList');
    if (abilityList) {
      abilityList.innerHTML = '';
      pokeData.abilities.forEach(a => {
        const item = document.createElement('div');
        item.className = 'ability-item' + (a.is_hidden ? ' hidden-ability' : '');
        item.innerHTML = window.DexAPI.capitalize(a.ability.name) + (a.is_hidden ? `<span class="ability-sublabel">Hidden</span>` : '');
        abilityList.appendChild(item);
      });
    }

    // 6. Base Stats & Interactive Radar Chart
    renderStats(pokeData.stats);

    // 7. Type Matchups (Weaknesses / Resistances / Immunities)
    renderTypeMatchups(pokeData.types.map(t => t.type.name));

    // 8. Size & Genus
    if ($('sizeHt')) $('sizeHt').textContent = metersToFeetInches(pokeData.height / 10);
    if ($('sizeWt')) $('sizeWt').textContent = kgToLbs(pokeData.weight / 10);
    const engGenus = speciesData.genera?.find(g => g.language.name === 'en');
    if ($('pokeGenus')) $('pokeGenus').textContent = engGenus ? engGenus.genus : '';

    // 9. Dex Entry
    const entries = speciesData.flavor_text_entries?.filter(e => e.language.name === 'en');
    if (entries && entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      if ($('dexEntryText')) {
        $('dexEntryText').textContent = lastEntry.flavor_text.replace(/\f/g, ' ').replace(/\u00ad/g, '').replace(/\n/g, ' ');
      }
      if ($('dexEntryGame')) {
        $('dexEntryGame').textContent = `— ${window.DexAPI.capitalize(lastEntry.version.name).toUpperCase()}`;
      }
    } else {
      if ($('dexEntryText')) $('dexEntryText').textContent = 'No Pokédex entry available.';
      if ($('dexEntryGame')) $('dexEntryGame').textContent = '';
    }
  }

  function updateGenderBtnUI() {
    const genderBtn = $('genderBtn');
    const state = window.DexState;
    if (!genderBtn) return;

    if (state.gender === 'female') {
      genderBtn.className = "gender-btn female-active";
      genderBtn.innerHTML = `<span>♀</span> Female`;
    } else {
      genderBtn.className = "gender-btn male-active";
      genderBtn.innerHTML = `<span>♂</span> Male`;
    }
  }

  function updateSprite(pokeData) {
    const state = window.DexState;
    const sprite = $('pokeSprite');
    const ballBg = $('ballBg');
    const shinyStars = $('shinyStars');
    if (!sprite) return;

    const sprites = pokeData.sprites;
    let url;

    const isFemale = state.gender === 'female' && state.hasFemaleSprite;
    const isShiny = state.isShiny;

    if (isFemale) {
      if (isShiny) {
        url = sprites.other?.['official-artwork']?.front_shiny_female ||
              sprites.other?.home?.front_shiny_female ||
              sprites.front_shiny_female ||
              sprites.other?.['official-artwork']?.front_shiny;
      } else {
        url = sprites.other?.['official-artwork']?.front_female ||
              sprites.other?.home?.front_female ||
              sprites.front_female ||
              sprites.other?.['official-artwork']?.front_default;
      }
    } else {
      if (isShiny) {
        url = sprites.other?.['official-artwork']?.front_shiny ||
              sprites.other?.home?.front_shiny ||
              sprites.front_shiny;
      } else {
        url = sprites.other?.['official-artwork']?.front_default ||
              sprites.other?.home?.front_default ||
              sprites.front_default;
      }
    }

    sprite.classList.add('loading');
    setTimeout(() => {
      sprite.src = url || '';
      sprite.onload = () => {
        sprite.classList.remove('loading');
        sprite.classList.toggle('shiny-glow', isShiny);
      };
      sprite.onerror = () => {
        sprite.classList.remove('loading');
      };
    }, 100);

    if (ballBg) {
      ballBg.style.filter = isShiny ? 'hue-rotate(40deg) sepia(0.3)' : '';
    }
    if (shinyStars) {
      shinyStars.classList.toggle('visible', isShiny);
    }
  }

  function renderStats(stats) {
    const state = window.DexState;
    const statsGrid = $('statsGrid');
    const statRadarContainer = $('radarChartContainer');

    // Update Chart.js Radar
    window.DexChart.initOrUpdateChart(stats);

    // Update Linear Progress Bars
    if (!statsGrid) return;
    statsGrid.innerHTML = '';
    const statLabels = { hp: 'HP', attack: 'ATK', defense: 'DEF', 'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD' };
    const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

    statOrder.forEach(key => {
      const st = stats.find(s => s.stat.name === key);
      const val = st ? st.base_stat : 0;
      const pct = Math.min(100, Math.round(val / 255 * 100));
      const color = val < 50 ? '#c0392b' : val < 80 ? '#e67e22' : val < 110 ? '#f1c40f' : '#27ae60';

      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <span class="stat-label">${statLabels[key]}</span>
        <span class="stat-val">${val}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" data-pct="${pct}" style="width:0%; background:linear-gradient(90deg, #8b0000, ${color}); box-shadow:0 0 8px ${color}80"></div>
        </div>`;
      statsGrid.appendChild(row);
    });

    setTimeout(() => {
      statsGrid.querySelectorAll('.stat-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }, 80);

    // Toggle view
    if (state.chartMode === 'radar') {
      if (statRadarContainer) statRadarContainer.classList.remove('hidden');
      if (statsGrid) statsGrid.classList.add('hidden');
    } else {
      if (statRadarContainer) statRadarContainer.classList.add('hidden');
      if (statsGrid) statsGrid.classList.remove('hidden');
    }
  }

  function renderTypeMatchups(typesList) {
    const matchupsContainer = $('typeMatchups');
    if (!matchupsContainer) return;

    const data = window.TypeCalculator.calculateMatchups(typesList);
    matchupsContainer.innerHTML = '';

    const groups = [
      { title: 'Weaknesses', items: [...data.weakness4x.map(t => ({ t, m: '4x' })), ...data.weakness2x.map(t => ({ t, m: '2x' }))] },
      { title: 'Resistances', items: [...data.resistance05x.map(t => ({ t, m: '0.5x' })), ...data.resistance025x.map(t => ({ t, m: '0.25x' }))] },
      { title: 'Immunities', items: data.immunity0x.map(t => ({ t, m: '0x' })) }
    ];

    groups.forEach(g => {
      if (g.items.length === 0) return;
      const groupEl = document.createElement('div');
      groupEl.className = 'matchups-group';
      groupEl.innerHTML = `<div class="matchups-title">${g.title}</div>`;

      const listEl = document.createElement('div');
      listEl.className = 'matchup-list';

      g.items.forEach(item => {
        const tag = document.createElement('span');
        tag.className = `matchup-tag type-${item.t}`;
        tag.innerHTML = `${item.t.toUpperCase()} <span class="matchup-multiplier">${item.m}</span>`;
        listEl.appendChild(tag);
      });

      groupEl.appendChild(listEl);
      matchupsContainer.appendChild(groupEl);
    });
  }

  function renderFormSelector(forms, activeIndex, onSelect) {
    const wrap = $('formSelector');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (!forms || forms.length <= 1) return;

    forms.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = 'form-btn' + (idx === activeIndex ? ' active' : '');
      btn.textContent = f.label;
      btn.addEventListener('click', () => onSelect(idx));
      wrap.appendChild(btn);
    });
  }

  async function renderEvoChain(chainData, currentPokeId, onSelectPoke) {
    const evoChain = $('evoChain');
    if (!evoChain) return;
    evoChain.innerHTML = '';

    const tiers = [];

    function collectTier(node, level, parentName = null) {
      if (!tiers[level]) tiers[level] = [];
      const detail = node.evolution_details?.[0];
      let triggerText = '→';
      if (detail) {
        if (detail.min_level) triggerText = `Lv.${detail.min_level}`;
        else if (detail.item) triggerText = window.DexAPI.capitalize(detail.item.name);
        else if (detail.trigger?.name === 'trade') triggerText = 'Trade';
        else if (detail.trigger?.name === 'use-item') triggerText = 'Item';
        else if (detail.min_happiness) triggerText = 'Friendship';
      }

      tiers[level].push({
        name: node.species.name,
        triggerText,
        parentName
      });

      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach(child => collectTier(child, level + 1, node.species.name));
      }
    }

    collectTier(chainData.chain, 0);

    if (tiers.length <= 1 && (!tiers[0] || tiers[0].length <= 1)) {
      evoChain.innerHTML = `<div class="evo-stage no-evo">Does not evolve.</div>`;
      return;
    }

    const container = document.createElement('div');
    container.className = 'evo-tree-wrap';

    for (let l = 0; l < tiers.length; l++) {
      const tierNodes = tiers[l];
      const tierCol = document.createElement('div');
      tierCol.className = 'evo-tier-column';

      if (l > 0) {
        const arrowCol = document.createElement('div');
        arrowCol.className = 'evo-arrow-column';
        arrowCol.innerHTML = `<span>▶</span>`;
        container.appendChild(arrowCol);
      }

      for (const node of tierNodes) {
        const pData = await window.DexAPI.fetchJSON(`https://pokeapi.co/api/v2/pokemon/${node.name}`).catch(() => null);

        const stageEl = document.createElement('div');
        stageEl.className = 'evo-stage';
        const spriteUrl = pData?.sprites?.other?.['official-artwork']?.front_default || pData?.sprites?.front_default || '';
        const isCurrent = pData?.id === currentPokeId;

        stageEl.innerHTML = `
          <div class="evo-img-wrap${isCurrent ? ' current' : ''}">
            <img src="${spriteUrl}" alt="${node.name}" loading="lazy"/>
          </div>
          <div class="evo-name">${window.DexAPI.capitalize(node.name)}</div>
          ${node.triggerText !== '→' ? `<div class="evo-lv">${node.triggerText}</div>` : ''}
        `;

        stageEl.addEventListener('click', () => {
          if (pData?.id) onSelectPoke(pData.id);
        });

        tierCol.appendChild(stageEl);
      }

      container.appendChild(tierCol);
    }

    evoChain.appendChild(container);
  }

  function metersToFeetInches(m) {
    const totalInches = Math.round(m * 39.3701);
    return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
  }

  function kgToLbs(kg) {
    return (kg * 2.20462).toFixed(1) + ' lbs';
  }

  return {
    renderPokemon,
    updateSprite,
    updateGenderBtnUI,
    renderFormSelector,
    renderEvoChain
  };
})();
