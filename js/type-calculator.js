/* ============================================================
   DEXPULSE TYPE EFFECTIVENESS & MATCHUP CALCULATOR
   ============================================================ */

window.TypeCalculator = (function () {
  const types = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Attacking Type -> Defending Type damage factors (0, 0.5, 1, 2)
  // Rows: Attacking, Columns: Defending
  const matrix = {
    normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
    fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
    dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  function getSingleFactor(attacker, defender) {
    if (matrix[attacker] && matrix[attacker][defender] !== undefined) {
      return matrix[attacker][defender];
    }
    return 1; // Default neutral factor
  }

  function calculateMatchups(defenderTypes) {
    const results = {
      weakness4x: [],
      weakness2x: [],
      resistance05x: [],
      resistance025x: [],
      immunity0x: []
    };

    types.forEach(attacker => {
      let multiplier = 1;
      defenderTypes.forEach(defType => {
        multiplier *= getSingleFactor(attacker, defType.toLowerCase());
      });

      if (multiplier === 4) {
        results.weakness4x.push(attacker);
      } else if (multiplier === 2) {
        results.weakness2x.push(attacker);
      } else if (multiplier === 0.5) {
        results.resistance05x.push(attacker);
      } else if (multiplier === 0.25) {
        results.resistance025x.push(attacker);
      } else if (multiplier === 0) {
        results.immunity0x.push(attacker);
      }
    });

    return results;
  }

  return {
    calculateMatchups,
    allTypes: types
  };
})();
