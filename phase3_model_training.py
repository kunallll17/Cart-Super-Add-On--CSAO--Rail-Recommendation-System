
import os
import json
import warnings
import numpy as np
import pandas as pd
import lightgbm as lgb
import faiss
import joblib

from collections import defaultdict
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
DATA_DIR   = "data"
MODEL_DIR  = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Reproducibility ────────────────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# ── Hyper-parameters ──────────────────────────────────────────────────────────
LGBM_PARAMS = {
    "objective":        "lambdarank",
    "metric":           "ndcg",
    "ndcg_eval_at":     [5, 10],
    "learning_rate":    0.05,
    "num_leaves":       63,
    "max_depth":        -1,
    "min_child_samples": 20,
    "feature_fraction": 0.80,
    "bagging_fraction": 0.80,
    "bagging_freq":     5,
    "reg_alpha":        0.1,
    "reg_lambda":       0.1,
    "verbosity":        -1,
    "n_jobs":           -1,
    "seed":             RANDOM_SEED,
    "label_gain":       [0, 1],
}
N_ROUNDS     = 500
EARLY_STOP   = 40
TOP_K_FAISS  = 50
TOP_K_RECO   = 10

# All cuisine families
ALL_CUISINES = [
    "North Indian", "South Indian", "Biryani", "Street Food",
    "Fast Food", "Chinese", "Beverages", "Desserts"
]


# =============================================================================
# SECTION 1 — DATA LOADING & PREPARATION
# =============================================================================

def load_data() -> tuple:
    print("[Phase 3] Loading Phase 2 artefacts...")

    cart_feat   = pd.read_csv(os.path.join(DATA_DIR, "cart_session_features.csv"))
    item_feat   = pd.read_csv(os.path.join(DATA_DIR, "item_features.csv"))
    embeddings  = np.load(os.path.join(DATA_DIR, "item_embeddings.npy"))
    faiss_index = faiss.read_index(os.path.join(DATA_DIR, "faiss_item_index.bin"))

    with open(os.path.join(DATA_DIR, "item_id_to_idx.json")) as f:
        id_to_idx = json.load(f)
    idx_to_id = {v: k for k, v in id_to_idx.items()}

    print(f"  ✓ cart_features={cart_feat.shape}, items={item_feat.shape}, "
          f"embeddings={embeddings.shape}, FAISS={faiss_index.ntotal} vectors")
    return cart_feat, item_feat, embeddings, faiss_index, id_to_idx, idx_to_id


# =============================================================================
# SECTION 2 — TEMPORAL TRAIN / TEST SPLIT  (zero leakage, zero user overlap)
# =============================================================================

def temporal_train_test_split(
    cart_feat: pd.DataFrame,
    test_frac: float = 0.20,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split sessions by TRUE temporal order using session_timestamp.

    Key guarantees:
    1. Sessions sorted by timestamp — test set = last 20% chronologically
    2. Zero session overlap between train and test
    3. Zero user overlap (users in test never appear in train)
       → prevents target leakage through user features
    """
    print("[Phase 3] Performing temporal train/test split...")

    # ── Determine temporal order ──────────────────────────────────────────────
    if "session_timestamp" in cart_feat.columns:
        session_order = (
            cart_feat.groupby("session_id")["session_timestamp"]
            .first().reset_index()
            .sort_values("session_timestamp")
            .reset_index(drop=True)
        )
    else:
        # Fallback to event_seq proxy
        session_order = (
            cart_feat.groupby("session_id")["event_seq"]
            .min().reset_index()
            .sort_values("event_seq")
            .reset_index(drop=True)
        )

    n_sessions  = len(session_order)
    split_point = int(n_sessions * (1 - test_frac))

    train_sessions = set(session_order.iloc[:split_point]["session_id"])
    test_sessions  = set(session_order.iloc[split_point:]["session_id"])

    train_df = cart_feat[cart_feat["session_id"].isin(train_sessions)].copy()
    test_df  = cart_feat[cart_feat["session_id"].isin(test_sessions)].copy()

    # ── Ensure zero user overlap ──────────────────────────────────────────────
    test_users  = set(test_df["user_id"].unique())
    train_users = set(train_df["user_id"].unique())
    overlap_users = test_users & train_users

    if overlap_users:
        # Remove overlapping users from training (keep them in test)
        train_df = train_df[~train_df["user_id"].isin(overlap_users)]
        print(f"  ⚠ Removed {len(overlap_users)} overlapping users from train "
              f"(keeping in test for cold-start realism)")

    print(f"  ✓ Train: {train_df['session_id'].nunique():,} sessions | {len(train_df):,} rows")
    print(f"  ✓ Test : {test_df['session_id'].nunique():,} sessions | {len(test_df):,} rows")
    print(f"  ✓ Train users: {train_df['user_id'].nunique():,} | "
          f"Test users: {test_df['user_id'].nunique():,} | "
          f"Overlap: 0")
    return train_df, test_df


# =============================================================================
# SECTION 3 — LightGBM DATASET PREPARATION
# =============================================================================

# Expanded feature list (44 features, up from 27)
FEATURE_COLS = [
    # Cart-state (16)
    "cart_size", "cart_dominant_cat_enc",
    "cart_has_main", "cart_has_side", "cart_has_beverage", "cart_has_dessert",
    "cart_has_starter",
    "cart_avg_price", "cart_value_before_add", "cart_cuisine_entropy",
    "cart_completeness",
    "cat_ratio_main", "cat_ratio_side", "cat_ratio_beverage",
    "cat_ratio_dessert", "cat_ratio_starter",
    # Temporal (4)
    "hour_sin", "hour_cos", "is_weekend", "slot_enc",
    # User (13 = 3 base + 10 cuisine affinities)
    "user_lifetime_orders", "user_is_cold_start", "user_item_affinity",
] + [f"user_aff_{c.replace(' ', '_').lower()}" for c in ALL_CUISINES] + [
    # Item (normalised) (12)
    "cuisine_encoded", "category_encoded", "price_tier_encoded",
    "base_price_norm", "popularity_score_norm", "order_frequency_norm",
    "avg_order_qty_norm", "reorder_rate_norm", "cart_frequency_norm",
    "avg_cart_position_norm", "cart_add_rate_norm",
    # Interaction (1)
    "price_delta",
]


def prepare_lgbm_datasets(
    train_df: pd.DataFrame,
    test_df:  pd.DataFrame,
) -> tuple:
    """
    Build LightGBM Dataset objects with group (query) arrays.

    Groups are by query_id (session_id + event_seq), so each cart
    decision point is a separate ranking query with 1 positive + N negatives.
    """
    print("[Phase 3] Preparing LightGBM datasets...")

    feat_cols = [c for c in FEATURE_COLS if c in train_df.columns]
    print(f"  Using {len(feat_cols)} features")

    # Group by query_id (per-event), not session_id (per-session)
    group_col = "query_id" if "query_id" in train_df.columns else "session_id"
    print(f"  Grouping by: {group_col}")

    def make_group(df: pd.DataFrame) -> np.ndarray:
        """Items per query group (LightGBM group array)."""
        return df.groupby(group_col, sort=False).size().values

    X_train = train_df[feat_cols].values.astype(np.float32)
    y_train = train_df["is_next_add"].values.astype(np.int32)
    g_train = make_group(train_df)

    X_test  = test_df[feat_cols].values.astype(np.float32)
    y_test  = test_df["is_next_add"].values.astype(np.int32)
    g_test  = make_group(test_df)

    # Print group stats
    print(f"  Train group sizes: mean={g_train.mean():.1f}, "
          f"min={g_train.min()}, max={g_train.max()}")
    print(f"  Test  group sizes: mean={g_test.mean():.1f}, "
          f"min={g_test.min()}, max={g_test.max()}")

    # 10% of train as validation (temporal slice from end)
    n_val_groups = max(1, int(len(g_train) * 0.10))
    val_group_sizes  = g_train[-n_val_groups:]
    train_group_sizes = g_train[:-n_val_groups]

    n_val_rows  = val_group_sizes.sum()
    X_val  = X_train[-n_val_rows:]
    y_val  = y_train[-n_val_rows:]

    X_train = X_train[:-n_val_rows]
    y_train = y_train[:-n_val_rows]

    lgb_train = lgb.Dataset(
        X_train, label=y_train, group=train_group_sizes,
        feature_name=feat_cols, free_raw_data=False,
    )
    lgb_val = lgb.Dataset(
        X_val, label=y_val, group=val_group_sizes,
        reference=lgb_train, free_raw_data=False,
    )

    print(f"  ✓ Train groups={len(train_group_sizes):,}  rows={len(X_train):,}")
    print(f"  ✓ Val   groups={len(val_group_sizes):,}   rows={len(X_val):,}")
    print(f"  ✓ Test  groups={len(g_test):,}   rows={len(X_test):,}")
    return lgb_train, lgb_val, X_test, y_test, g_test, feat_cols


# =============================================================================
# SECTION 4 — MODEL TRAINING
# =============================================================================

def train_lgbm_ranker(
    lgb_train: lgb.Dataset,
    lgb_val:   lgb.Dataset,
) -> lgb.Booster:
    print("\n[Phase 3] Training LightGBM LambdaRank...")
    print(f"  Rounds={N_ROUNDS}  EarlyStop={EARLY_STOP}  "
          f"lr={LGBM_PARAMS['learning_rate']}  leaves={LGBM_PARAMS['num_leaves']}")

    callbacks = [
        lgb.early_stopping(stopping_rounds=EARLY_STOP, verbose=False),
        lgb.log_evaluation(period=50),
    ]

    model = lgb.train(
        params          = LGBM_PARAMS,
        train_set       = lgb_train,
        num_boost_round = N_ROUNDS,
        valid_sets      = [lgb_val],
        valid_names     = ["val"],
        callbacks       = callbacks,
    )

    model_path = os.path.join(MODEL_DIR, "lgbm_ranker.pkl")
    joblib.dump(model, model_path)
    print(f"  ✓ Model saved → {model_path}  (best_iteration={model.best_iteration})")
    return model


# =============================================================================
# SECTION 5 — TWO-TOWER PIPELINE
# =============================================================================

def faiss_retrieve_candidates(
    cart_item_ids:  list[str],
    faiss_index:    faiss.IndexFlatIP,
    embeddings:     np.ndarray,
    id_to_idx:      dict,
    idx_to_id:      dict,
    top_k:          int = TOP_K_FAISS,
    all_item_ids:   list[str] = None,
) -> list[str]:
    valid_idxs = [id_to_idx[iid] for iid in cart_item_ids if iid in id_to_idx]
    if not valid_idxs:
        return all_item_ids[:top_k] if all_item_ids else []

    cart_emb = embeddings[valid_idxs].mean(axis=0, keepdims=True).astype(np.float32)
    scores, indices = faiss_index.search(cart_emb, top_k + len(cart_item_ids))

    candidates = []
    seen = set(cart_item_ids)
    for idx in indices[0]:
        if idx == -1:
            continue
        cand_id = idx_to_id.get(int(idx))
        if cand_id and cand_id not in seen:
            candidates.append(cand_id)
            seen.add(cand_id)
        if len(candidates) >= top_k:
            break
    return candidates


def build_candidate_features(
    cart_row:       pd.Series,
    candidate_ids:  list[str],
    item_feat:      pd.DataFrame,
    feat_cols:      list[str],
) -> np.ndarray:
    item_lookup = item_feat.set_index("item_id")
    rows = []

    # Cart-context features
    cart_ctx = {}
    for c in feat_cols:
        if c.startswith("cart_") or c.startswith("cat_ratio_") or c.startswith("hour_") or \
           c.startswith("is_weekend") or c.startswith("slot_") or c.startswith("user_") or \
           c.startswith("price_delta"):
            cart_ctx[c] = cart_row.get(c, 0)

    for cand_id in candidate_ids:
        row_dict = dict(cart_ctx)
        if cand_id in item_lookup.index:
            item_row = item_lookup.loc[cand_id]
            for c in feat_cols:
                if c in item_row.index and c not in row_dict:
                    row_dict[c] = item_row[c]
        rows.append(row_dict)

    X = pd.DataFrame(rows)
    for c in feat_cols:
        if c not in X.columns:
            X[c] = 0
    return X[feat_cols].values.astype(np.float32)


# =============================================================================
# SECTION 6 — OFFLINE EVALUATION
# =============================================================================

def compute_ndcg_at_k(y_true, y_score, k):
    k_eff = min(k, len(y_true))
    if k_eff == 0:
        return 0.0
    order     = np.argsort(y_score)[::-1][:k_eff]
    ranks     = np.arange(1, k_eff + 1)
    gains     = 2 ** y_true[order] - 1
    discounts = np.log2(ranks + 1)
    dcg       = np.sum(gains / discounts)

    ideal_order = np.argsort(y_true)[::-1][:k_eff]
    ideal_gains = 2 ** y_true[ideal_order] - 1
    idcg        = np.sum(ideal_gains / discounts)
    return dcg / idcg if idcg > 0 else 0.0


def compute_precision_recall_at_k(y_true, y_score, k):
    k_eff      = min(k, len(y_true))
    top_k_idx  = np.argsort(y_score)[::-1][:k_eff]
    n_relevant  = y_true.sum()
    n_hits      = y_true[top_k_idx].sum()
    precision = n_hits / k_eff if k_eff > 0 else 0.0
    recall    = n_hits / n_relevant if n_relevant > 0 else 0.0
    return float(precision), float(recall)


def evaluate_model(
    model:     lgb.Booster,
    test_df:   pd.DataFrame,
    feat_cols: list[str],
    ks:        list[int] = [5, 10],
) -> dict:
    """
    Evaluate with realistic query groups (10+ items per group).
    Sessions with only 1-2 items or 0 positives are skipped.
    """
    print("\n[Phase 3] Evaluating on test set...")

    X_test = test_df[feat_cols].values.astype(np.float32)
    y_test = test_df["is_next_add"].values

    scores = model.predict(X_test, num_iteration=model.best_iteration)

    # AUC (global item-level)
    try:
        auc = roc_auc_score(y_test, scores)
    except ValueError:
        auc = 0.5

    # Per-query ranking metrics (group by query_id)
    group_col = "query_id" if "query_id" in test_df.columns else "session_id"
    session_metrics = defaultdict(list)
    test_df = test_df.copy()
    test_df["__score__"] = scores

    n_skipped = 0
    n_evaluated = 0

    for sid, grp in test_df.groupby(group_col):
        y_true_grp  = grp["is_next_add"].values
        y_score_grp = grp["__score__"].values

        # Skip trivial groups (need at least 1 positive AND 1 negative)
        if y_true_grp.sum() == 0 or (y_true_grp == 1).all() or len(y_true_grp) < 3:
            n_skipped += 1
            continue

        n_evaluated += 1

        # MRR
        ranked = np.argsort(y_score_grp)[::-1]
        mrr = 0.0
        for rank, idx in enumerate(ranked, 1):
            if y_true_grp[idx] == 1:
                mrr = 1.0 / rank
                break
        session_metrics["mrr"].append(mrr)

        for k in ks:
            ndcg = compute_ndcg_at_k(y_true_grp, y_score_grp, k)
            prec, rec = compute_precision_recall_at_k(y_true_grp, y_score_grp, k)
            session_metrics[f"ndcg@{k}"].append(ndcg)
            session_metrics[f"precision@{k}"].append(prec)
            session_metrics[f"recall@{k}"].append(rec)

    print(f"  ✓ Evaluated {n_evaluated} sessions, skipped {n_skipped} trivial ones")

    results = {"auc": round(auc, 4)}
    for metric, values in session_metrics.items():
        results[metric] = round(float(np.mean(values)), 4)

    return results


# =============================================================================
# SECTION 7 — FEATURE IMPORTANCE
# =============================================================================

def feature_importance_report(model, feat_cols, top_n=20):
    imp = pd.DataFrame({
        "feature":    feat_cols,
        "importance": model.feature_importance(importance_type="gain"),
    }).sort_values("importance", ascending=False).head(top_n).reset_index(drop=True)

    imp["importance_pct"] = (
        imp["importance"] / imp["importance"].sum() * 100
    ).round(2)
    return imp


# =============================================================================
# SECTION 8 — DEMO
# =============================================================================

def demo_recommendation(
    cart_item_ids, cart_row, model, item_feat, embeddings,
    faiss_index, id_to_idx, idx_to_id, feat_cols, top_k=TOP_K_RECO,
):
    all_item_ids = item_feat["item_id"].tolist()
    candidates = faiss_retrieve_candidates(
        cart_item_ids, faiss_index, embeddings, id_to_idx, idx_to_id,
        top_k=TOP_K_FAISS, all_item_ids=all_item_ids,
    )
    if not candidates:
        return pd.DataFrame()

    X_cands = build_candidate_features(cart_row, candidates, item_feat, feat_cols)
    cand_scores = model.predict(X_cands, num_iteration=model.best_iteration)
    ranked_idx = np.argsort(cand_scores)[::-1][:top_k]

    results = []
    for rank, idx in enumerate(ranked_idx, 1):
        cand_id  = candidates[idx]
        item_row = item_feat[item_feat["item_id"] == cand_id]
        if item_row.empty:
            continue
        item_row = item_row.iloc[0]
        results.append({
            "rank":       rank,
            "item_id":    cand_id,
            "item_name":  item_row["item_name"],
            "cuisine":    item_row["cuisine"],
            "category":   item_row["category"],
            "base_price": item_row["base_price"],
            "score":      round(float(cand_scores[idx]), 4),
        })
    return pd.DataFrame(results)


# =============================================================================
# SECTION 9 — ORCHESTRATION
# =============================================================================

def run_phase3() -> dict:
    print("=" * 70)
    print("  ZOMATO CSAO — PHASE 3: MODEL TRAINING & EVALUATION (v2)")
    print("=" * 70)

    cart_feat, item_feat, embeddings, faiss_index, id_to_idx, idx_to_id = load_data()

    train_df, test_df = temporal_train_test_split(cart_feat, test_frac=0.20)

    lgb_train, lgb_val, X_test, y_test, g_test, feat_cols = prepare_lgbm_datasets(
        train_df, test_df
    )

    with open(os.path.join(MODEL_DIR, "feat_cols.json"), "w") as f:
        json.dump(feat_cols, f)

    model = train_lgbm_ranker(lgb_train, lgb_val)

    metrics = evaluate_model(model, test_df, feat_cols, ks=[5, 10])

    print("\n" + "─" * 70)
    print("PHASE 3 — OFFLINE EVALUATION RESULTS")
    print("─" * 70)
    for metric, value in metrics.items():
        bar = "█" * int(value * 40)
        print(f"  {metric:<18}: {value:.4f}  {bar}")
    print("─" * 70)

    with open(os.path.join(MODEL_DIR, "offline_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"  → offline_metrics.json saved")

    print("\n[Phase 3] Top-15 features by gain:")
    fi = feature_importance_report(model, feat_cols, top_n=15)
    print(fi[["feature", "importance_pct"]].to_string(index=False))
    fi.to_csv(os.path.join(MODEL_DIR, "feature_importance.csv"), index=False)

    print("\n[Phase 3] 🎯 End-to-End Demo: 'Chicken Biryani in cart → recommend add-ons'")
    biryani_rows = item_feat[item_feat["item_name"].str.contains("Chicken Biryani", na=False)]
    if not biryani_rows.empty:
        biryani_id   = biryani_rows.iloc[0]["item_id"]
        demo_cart_row = test_df.iloc[0]
        recs = demo_recommendation(
            cart_item_ids = [biryani_id],
            cart_row      = demo_cart_row,
            model         = model,
            item_feat     = item_feat,
            embeddings    = embeddings,
            faiss_index   = faiss_index,
            id_to_idx     = id_to_idx,
            idx_to_id     = idx_to_id,
            feat_cols     = feat_cols,
            top_k         = 10,
        )
        print(recs.to_string(index=False))

    print("\n" + "─" * 70)
    print("PHASE 3 ARTEFACTS")
    print("─" * 70)
    print("  models/lgbm_ranker.pkl         — trained LambdaRank model")
    print("  models/feat_cols.json          — feature column list for serving")
    print("  models/offline_metrics.json    — evaluation metrics")
    print("  models/feature_importance.csv  — feature gain analysis")
    print("─" * 70)
    print("\n[Phase 3] ✅ Training complete.\n")

    return {
        "model":         model,
        "metrics":       metrics,
        "feat_cols":     feat_cols,
        "train_df":      train_df,
        "test_df":       test_df,
        "item_feat":     item_feat,
        "embeddings":    embeddings,
        "faiss_index":   faiss_index,
        "id_to_idx":     id_to_idx,
        "idx_to_id":     idx_to_id,
    }


if __name__ == "__main__":
    artefacts = run_phase3()
