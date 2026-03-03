# CSAO Rail — Live Demo UI

A production-quality React demo for the **Cart Super Add-On (CSAO) Rail Recommendation System** built for the **Zomato Hackathon 2026**.

## Tech Stack

- **React 18** + **Vite 6** — fast dev server, instant HMR
- **Tailwind CSS 3** — Zomato brand colors, dark mode via `prefers-color-scheme`
- **Axios** — API calls to the FastAPI backend
- No UI component libraries — everything hand-crafted

## Quick Start

```bash
# From the project root (D:\Zomathon_Anti\frontend)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Demo

### Mock Mode (default — no backend needed)
1. Select a restaurant from the dropdown
2. Add items to your cart using the **+** buttons
3. Click **⚡ Get Recommendations**
4. Watch the CSAO rail populate with ranked add-on suggestions
5. Hover over the **?** button on any card to see the "why" explanation
6. Click **+ Add to Cart** on a recommendation to accept it
7. Watch the Session AOV tracker update in Column 3

### Live API Mode
1. Start the FastAPI backend from the project root:
   ```bash
   cd ..
   python phase5_api_server.py serve
   ```
2. In the UI, switch the **Data Source** toggle to **Live API**
3. Add items and click **⚡ Get Recommendations**

> **Note:** Live API mode requires the backend at `localhost:8000`. The Vite dev server proxies `/api/*` → `http://localhost:8000/*` automatically, avoiding CORS issues.

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CSAO Rail — Live Demo  │  Team Zomathon · Zomato Hackathon 2026        │
├──────────────────┬──────────────────────────────┬──────────────────────┤
│  Column 1        │  Column 2                    │  Column 3            │
│  Cart Builder    │  CSAO Recommendation Rail    │  Live Model Stats    │
│                  │                              │                      │
│  • Restaurant    │  • Top-5 add-on cards        │  • Mock / Live toggle│
│    selector      │  • Score bars                │  • Request counter   │
│  • Menu grid     │  • "Why?" tooltips           │  • Session AOV       │
│  • Cart panel    │  • Latency badge             │  • Model metrics     │
│  • Completeness  │  • Loading skeletons         │    AUC / NDCG / MRR  │
│    progress bar  │                              │                      │
└──────────────────┴──────────────────────────────┴──────────────────────┘
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Top nav bar
│   │   ├── CartBuilder.jsx         # Column 1 container
│   │   ├── MenuGrid.jsx            # Categorized menu item cards
│   │   ├── CartPanel.jsx           # Cart list + CTA button
│   │   ├── CompletenessBar.jsx     # Meal completeness progress
│   │   ├── RecommendationRail.jsx  # Column 2 container
│   │   ├── RecommendationCard.jsx  # Single recommendation tile
│   │   ├── StatsPanel.jsx          # Column 3 container
│   │   ├── MetricCard.jsx          # Single metric tile
│   │   └── ModeToggle.jsx          # Mock / Live toggle switch
│   ├── data/
│   │   └── mockData.js             # Restaurants, menus, mock recs
│   ├── hooks/
│   │   └── useRecommendations.js   # Fetch logic (mock + live)
│   ├── utils/
│   │   └── api.js                  # Axios client + helpers
│   ├── App.jsx                     # Root layout
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind + animations
├── index.html
├── package.json
├── vite.config.js                  # Dev proxy: /api → localhost:8000
├── tailwind.config.js
└── postcss.config.js
```

## Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder contains a fully static build ready for any CDN or static host.
