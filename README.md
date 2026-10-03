# DexPulse - Tactical Creature Index

**DexPulse** is a high-performance, responsive web application inspired by tactical data interfaces. Built with Vanilla JavaScript, HTML5, CSS3, and Chart.js, DexPulse provides comprehensive data, visual stat breakdowns, type matchups, gender variations, and multi-generation roster filtering.

---

##  Key Features

- **Detail & Roster Grid Views**: Toggle seamlessly between an analytical single-creature view and a responsive multi-generation grid roster.
- **Interactive Stat Radar Chart**: Visual stat distribution powered by Chart.js with an instant toggle to switch to traditional linear stat bars.
- **/ ♀ Gender Variations**: Toggle between male and female artwork and sprites when visual gender differences exist in the PokeAPI database.
- **Dynamic Type Matchups**: Automatically calculates dual-type damage multipliers (4x, 2x weak; 0.5x, 0.25x resistant; 0x immune).
- **Search Autocomplete**: Pre-fetches database names to provide instant datalist suggestions, avoiding search errors and typos.
- **Skeleton Loading States**: Replaces full-screen blocking overlays with smooth contextual shimmer loading placeholders inside UI panels.
- **Multi-Gen & Type Filter Modal**: Filter creatures across Generations I through IX (Kanto to Paldea) with customizable sorting (ID ascending/descending, alphabetical).
- **Custom Cyberpunk Scrollbar & Design System**: High-contrast dark theme with red/blue neon accents and custom styled scrollbars for smooth navigation.

---

##  GitHub Pages Deployment Guide

Deploying DexPulse to **GitHub Pages** is straightforward and requires zero build tools:

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial DexPulse release"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dexpulse.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub (`Settings` -> `Pages`).
   - Under **Build and deployment** -> **Source**, select `Deploy from a branch`.
   - Under **Branch**, select `main` and `/ (root)` folder.
   - Click **Save**. Your site will be live at `https://YOUR_USERNAME.github.io/dexpulse/` in a few moments!

---

##  Project Folder Structure

```
dexpulse/
├── index.html              # Main HTML entry point for GitHub Pages
├── pokedex.html            # Automatic redirect to index.html
├── README.md               # Project documentation & deployment guide
├── LICENSE                 # MIT License & Legal Disclaimer
├── .gitignore              # Git ignore configuration
├── css/
│   ├── variables.css       # Design tokens & color variables
│   ├── base.css            # Base typography, layout, scrollbar, header
│   ├── components.css      # Panels, identity, artwork, radar chart, matchups
│   ├── grid-view.css       # Roster grid layout & filter modal styles
│   └── skeletons.css      # Shimmer loading animations
└── js/
    ├── state.js            # Global application state manager
    ├── type-calculator.js  # 18-Type effectiveness damage matrix
    ├── api.js              # PokeAPI fetch service & autocomplete pre-fetcher
    ├── radar-chart.js      # Chart.js radar chart controller
    ├── skeleton.js         # Skeleton loading manager
    ├── grid-view.js        # Roster grid renderer & pagination controller
    ├── ui.js               # UI component renderer (artwork, gender, dex entry)
    └── app.js              # Application entry point & event handlers
```

---

##  Legal Disclaimer & Copyright Notice

**DexPulse** is an independent, open-source fan project built for educational, analytical, and portfolio purposes. 

Pokémon, Pokémon character names, artwork, sprites, and trademarked names are registered trademarks and copyright of **Nintendo**, **Game Freak**, **Creatures Inc.**, and **The Pokémon Company**. DexPulse is not affiliated with, sponsored, or endorsed by Nintendo or Game Freak.
