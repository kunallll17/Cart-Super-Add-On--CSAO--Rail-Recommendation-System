# Cart Super Add-On (CSAO) Rail Recommendation System

**Zomato Hackathon 2026 — Problem Statement 2.**  
Repo: [github.com/kunallll17/Cart-Super-Add-On--CSAO--Rail-Recommendation-System](https://github.com/kunallll17/Cart-Super-Add-On--CSAO--Rail-Recommendation-System)

When a user has items in their cart (e.g. biryani + drink), we recommend a short list of add-ons (sides, desserts, beverages) they’re likely to add — the “Cart Super Add-On” (CSAO) rail.

The project runs locally: synthetic data generation, feature engineering, LightGBM LambdaRank training, evaluation, and a FastAPI server. A React frontend (`frontend/`) lets you try the flow in mock mode (no backend) or against the live API. The full hackathon report is in `csao_report.tex` (compile with pdflatex for the PDF).

---

## What’s in the repo

The pipeline is split into five phases, run in order. Each phase is a single Python script; no notebooks.

| Phase | Script | What it does |
|-------|--------|----------------|
| 1 | `phase1_data_generation.py` | Generates synthetic Indian food-delivery data: users, restaurants, menus, orders, and cart add-on events. Writes CSVs into `data/`. |
| 2 | `phase2_feature_engineering.py` | Builds item embeddings, trains a small sequential model (SASRec-style), and creates a FAISS index for fast retrieval. Also outputs the feature matrix and metadata used in Phase 3. |
| 3 | `phase3_model_training.py` | Trains a LightGBM LambdaRank model on top of the Phase 2 features. Uses a proper temporal train/val/test split. Saves the ranker and feature config under `models/`. |
| 4 | `phase4_evaluation.py` | Evaluates the ranker (NDCG, precision, MRR, AUC), compares to a baseline, and writes business-impact metrics (e.g. projected AOV lift) into `evaluation/`. |
| 5 | `phase5_api_server.py` | FastAPI app that loads the FAISS index and LightGBM model and exposes `POST /recommend`. You can run it with `python phase5_api_server.py serve` or use the script in “benchmark” mode to get a latency report. |

The **frontend** (`frontend/`) is a Vite + React app that talks to that API. It has a simple menu, cart, and a “Pairs well with” rail that shows recommendations. You can use it in “mock” mode (no backend) or point it at the live API.

---

## How to run it

**Backend (data + model + API)**

1. Clone the repo and create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate     # Windows
   # source venv/bin/activate   # Linux / Mac
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the phases in order (each script prints what it’s doing):
   ```bash
   python phase1_data_generation.py
   python phase2_feature_engineering.py
   python phase3_model_training.py
   python phase4_evaluation.py
   ```

   After that you’ll have `data/` and `models/` populated. Don’t commit those; they’re in `.gitignore`.

4. Start the API server:
   ```bash
   python phase5_api_server.py serve
   ```
   Server runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

**Frontend**

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`. The dev server proxies `/api` to `localhost:8000`, so if the Python server is running you can switch the UI to “Live API” and get real recommendations. Otherwise leave it on “Mock” and it’ll use built-in mock data.

---

## Project layout

```
├── phase1_data_generation.py
├── phase2_feature_engineering.py
├── phase3_model_training.py
├── phase4_evaluation.py
├── phase5_api_server.py
├── requirements.txt
├── README.md
├── .gitignore
├── csao_report.tex          # Hackathon report (pdflatex to build PDF)
├── data/                    # created by phase 1 & 2 (not in git)
├── models/                  # created by phase 3 (not in git)
├── evaluation/              # created by phase 4 (outputs not in git)
└── frontend/                # Vite + React demo (Zomato-style UI)
    ├── src/
    │   ├── components/      # cart, menu, recommendation rail, etc.
    │   ├── data/            # mock restaurants & menus
    │   ├── hooks/           # useRecommendations (mock + live)
    │   └── utils/           # API client
    ├── index.html
    ├── package.json
    ├── vite.config.js       # proxy /api → localhost:8000
    └── tailwind.config.js
```

---

## Tech used

- **Data:** Synthetic generation with pandas/numpy; category mix and cuisine coverage tuned to look like real food-delivery data (e.g. mains, beverages, sides, desserts, starters).
- **Retrieval:** FAISS for fast approximate nearest-neighbour search over item embeddings (from Phase 2).
- **Ranking:** LightGBM with LambdaRank (NDCG objective). Features include cart-level stats, item/cart embeddings, category and cuisine signals, price deltas, etc.
- **API:** FastAPI + Uvicorn; single worker for the demo. Latency is well under 200 ms for the full recommend path (FAISS + feature build + LightGBM).
- **Frontend:** React 18, Vite, Tailwind, Axios. No component library; layout and styling are custom.

---

## Evaluation and targets

Phase 4 computes NDCG@5/10, precision, MRR, and AUC, and compares against a baseline. It also translates that into a rough business impact (e.g. AOV lift) under a few assumptions (acceptance rate, sessions per day, etc.). The targets we aimed for were:

- NDCG@10 ≥ 0.55  
- Precision@5 ≥ 0.30  
- p99 latency < 200 ms  
- Meaningful AOV lift vs baseline  

Exact numbers depend on the generated data and random seeds; run Phase 4 after Phase 3 to see your own results.

---

## Notes

- **Port 8000:** If “address already in use” appears when starting the server, something else is bound to 8000. On Windows you can find the process with `netstat -ano | findstr :8000` and stop it; the script also prints a short hint.
- **First run:** Phase 1 can take a couple of minutes; Phase 2 and 3 a bit longer depending on your machine. Phase 5 loads the saved model and FAISS index at startup, then serves requests quickly.
- **Frontend mock mode:** Uses hardcoded restaurants and menus in `frontend/src/data/mockData.js`. Item IDs there match the synthetic data so that when you switch to Live API, the same IDs are sent to the backend.

If you only want to try the UI without running the full pipeline, use the frontend in mock mode and skip the Python steps. For real recommendations and latency behaviour, run all five phases and then the API + frontend together.
