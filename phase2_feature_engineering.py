import os
import json
import numpy as np
import pandas as pd
from collections import defaultdict, Counter
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
import faiss
import warnings

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
DATA_DIR   = "data"
OUTPUT_DIR = "data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

EMBEDDING_DIM = 128
RANDOM_SEED   = 42
np.random.seed(RANDOM_SEED)

# ── Cart completeness weights (Binary Insights approach) ──────────────────────
COMPLETENESS_WEIGHTS = {
    "mains":     0.40,
    "beverages": 0.25,
    "sides":     0.20,
    "desserts":  0.10,
    "starters":  0.05,
}

# All cuisine families we expect
ALL_CUISINES = [
    "North Indian", "South Indian", "Biryani", "Street Food",
    "Fast Food", "Chinese", "Beverages", "Desserts"
]

# Negative sampling ratio: for each positive candidate, sample this many negatives
NEG_SAMPLE_RATIO = 4


# =============================================================================
# SECTION 1 — LOAD PHASE 1 DATA
# =============================================================================

def load_phase1_data() -> tuple[pd.DataFrame, ...]:
    print("[Phase 2] Loading Phase 1 data...")

    users       = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    restaurants = pd.read_csv(os.path.join(DATA_DIR, "restaurants.csv"))
    menu        = pd.read_csv(os.path.join(DATA_DIR, "menu_items.csv"))
    orders      = pd.read_csv(os.path.join(DATA_DIR, "historical_orders.csv"))
    cart        = pd.read_csv(os.path.join(DATA_DIR, "cart_sessions.csv"))

    print(f"  ✓ users={len(users)}, restaurants={len(restaurants)}, "
          f"menu={len(menu)}, orders={len(orders)}, cart={len(cart)}")
    return users, restaurants, menu, orders, cart


# =============================================================================
# SECTION 2 — ITEM-LEVEL STATIC FEATURES
# =============================================================================

def build_item_features(
    menu: pd.DataFrame,
    orders: pd.DataFrame,
    cart: pd.DataFrame,
) -> pd.DataFrame:
    """Build one feature row per menu item with enriched demand signals."""
    print("[Phase 2] Building item-level static features...")

    df = menu.copy()

    # ── Price tier ────────────────────────────────────────────────────────────
    df["price_tier"] = pd.qcut(
        df["base_price"], q=3, labels=["Budget", "Mid", "Premium"]
    ).astype(str)

    # ── Label encoders ────────────────────────────────────────────────────────
    le_cuisine  = LabelEncoder()
    le_category = LabelEncoder()
    le_price    = LabelEncoder()

    df["cuisine_encoded"]    = le_cuisine.fit_transform(df["cuisine"])
    df["category_encoded"]   = le_category.fit_transform(df["category"])
    df["price_tier_encoded"] = le_price.fit_transform(df["price_tier"])

    # ── Demand features from historical orders ────────────────────────────────
    order_agg = (
        orders.groupby("item_id")
        .agg(
            order_frequency = ("order_id", "count"),
            avg_order_qty   = ("quantity", "mean"),
        )
        .reset_index()
    )

    user_item_counts = orders.groupby(["item_id", "user_id"]).size().reset_index(name="cnt")
    reorder = (
        user_item_counts[user_item_counts["cnt"] > 1]
        .groupby("item_id")["user_id"].nunique()
        .reset_index(name="reorder_users")
    )
    total_users_per_item = (
        user_item_counts.groupby("item_id")["user_id"].nunique()
        .reset_index(name="total_users")
    )
    reorder_rate = reorder.merge(total_users_per_item, on="item_id")
    reorder_rate["reorder_rate"] = (
        reorder_rate["reorder_users"] / reorder_rate["total_users"]
    )

    # ── Cart frequency & position features ────────────────────────────────────
    cart_agg = (
        cart.groupby("item_id")
        .agg(
            cart_frequency     = ("session_id", "count"),
            avg_cart_position  = ("event_seq", "mean"),
        )
        .reset_index()
    )

    df = (
        df
        .merge(order_agg,   on="item_id", how="left")
        .merge(reorder_rate[["item_id", "reorder_rate"]], on="item_id", how="left")
        .merge(cart_agg, on="item_id", how="left")
    )

    df["order_frequency"]  = df["order_frequency"].fillna(0)
    df["avg_order_qty"]    = df["avg_order_qty"].fillna(1.0)
    df["reorder_rate"]     = df["reorder_rate"].fillna(0.0)
    df["cart_frequency"]   = df["cart_frequency"].fillna(0)
    df["avg_cart_position"]= df["avg_cart_position"].fillna(0.0)

    df["cart_add_rate"] = df["cart_frequency"] / (df["order_frequency"] + 1)

    # ── Normalise continuous features ─────────────────────────────────────────
    scaler = MinMaxScaler()
    scale_cols = [
        "base_price", "popularity_score", "order_frequency",
        "avg_order_qty", "reorder_rate", "cart_frequency",
        "avg_cart_position", "cart_add_rate",
    ]
    df[[c + "_norm" for c in scale_cols]] = scaler.fit_transform(df[scale_cols])

    keep = [
        "item_id", "restaurant_id", "item_name", "cuisine", "category",
        "is_veg", "price_tier", "base_price",
        "cuisine_encoded", "category_encoded", "price_tier_encoded",
        "popularity_score", "order_frequency", "avg_order_qty",
        "reorder_rate", "cart_frequency", "avg_cart_position", "cart_add_rate",
        "base_price_norm", "popularity_score_norm", "order_frequency_norm",
        "avg_order_qty_norm", "reorder_rate_norm", "cart_frequency_norm",
        "avg_cart_position_norm", "cart_add_rate_norm",
    ]
    df = df[keep]

    print(f"  ✓ item_features: {df.shape[0]} items × {df.shape[1]} features")
    return df


# =============================================================================
# SECTION 3 — THE AI EDGE: SEMANTIC EMBEDDINGS WITH PMI
# =============================================================================

AFFINITY_MAP = {
    "mains":      {"sides": 0.80, "beverages": 0.70, "desserts": 0.25, "starters": 0.30},
    "starters":   {"mains": 0.75, "sides": 0.35, "beverages": 0.50},
    "sides":      {"sides": 0.30, "beverages": 0.50, "mains": 0.20},
    "beverages":  {"desserts": 0.35, "mains": 0.10},
    "desserts":   {"beverages": 0.40},
}

INTRA_CUISINE_BOOST = 0.30


def _compute_pmi(cart: pd.DataFrame, item_features: pd.DataFrame) -> dict:
    """
    Compute Pointwise Mutual Information between item pairs from cart co-occurrences.
    Higher PMI = items appear together more often than expected by chance.
    """
    print("  [AI Edge] Computing PMI co-occurrence signals...")

    # Count item occurrences per session
    session_items = cart.groupby("session_id")["item_id"].apply(set).to_dict()
    n_sessions = len(session_items)

    item_counts = Counter()
    pair_counts = Counter()

    for sid, items in session_items.items():
        items = list(items)
        for i_id in items:
            item_counts[i_id] += 1
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                pair = tuple(sorted([items[i], items[j]]))
                pair_counts[pair] += 1

    # Compute PMI for top pairs
    pmi_dict = {}
    for (a, b), count_ab in pair_counts.items():
        if count_ab < 3:
            continue
        p_ab = count_ab / n_sessions
        p_a  = item_counts[a] / n_sessions
        p_b  = item_counts[b] / n_sessions
        pmi  = np.log2(p_ab / (p_a * p_b + 1e-10) + 1e-10)
        pmi_dict[(a, b)] = max(0, pmi)  # positive PMI only
        pmi_dict[(b, a)] = max(0, pmi)

    print(f"  [AI Edge] PMI: {len(pmi_dict)} item pair scores computed")
    return pmi_dict


def _build_affinity_graph(
    item_features: pd.DataFrame,
    pmi_dict: dict = None,
) -> dict[str, list[tuple[str, float]]]:
    """Build weighted complementary-item graph with PMI boost."""
    print("  [AI Edge] Building complementary-item affinity graph...")

    cat_index = defaultdict(list)
    for _, row in item_features.iterrows():
        cat_index[row["category"]].append(row)

    graph = defaultdict(list)

    for _, src in item_features.iterrows():
        src_cat     = src["category"]
        src_cuisine = src["cuisine"]
        affinity    = AFFINITY_MAP.get(src_cat, {})

        for tgt_cat, base_weight in affinity.items():
            for tgt in cat_index[tgt_cat]:
                if tgt["item_id"] == src["item_id"]:
                    continue
                cuisine_bonus = INTRA_CUISINE_BOOST if tgt["cuisine"] == src_cuisine else 0.0
                weight = (base_weight + cuisine_bonus) * (0.5 + 0.5 * tgt["popularity_score"])

                # PMI boost
                if pmi_dict:
                    pair_key = (src["item_id"], tgt["item_id"])
                    pmi_val = pmi_dict.get(pair_key, 0.0)
                    weight += 0.15 * pmi_val

                graph[src["item_id"]].append((tgt["item_id"], weight))

        graph[src["item_id"]] = sorted(
            graph[src["item_id"]], key=lambda x: x[1], reverse=True
        )[:20]

    edge_count = sum(len(v) for v in graph.values())
    print(f"  [AI Edge] Graph: {len(graph)} nodes, {edge_count} directed edges")
    return graph


def _simulate_llm_embeddings(
    item_features: pd.DataFrame,
    graph: dict[str, list[tuple[str, float]]],
    dim: int = EMBEDDING_DIM,
    walk_length: int = 10,
    n_walks: int = 20,
) -> tuple[np.ndarray, dict[str, int]]:
    """Simulate Node2Vec-style random-walk embeddings."""
    print(f"  [AI Edge] Generating {dim}-d semantic embeddings "
          f"({n_walks} walks × {walk_length} steps)...")

    items    = item_features["item_id"].tolist()
    n_items  = len(items)
    id_to_idx = {iid: idx for idx, iid in enumerate(items)}

    structural_cols = [
        "base_price_norm", "popularity_score_norm", "order_frequency_norm",
        "avg_order_qty_norm", "reorder_rate_norm", "cart_frequency_norm",
        "avg_cart_position_norm", "cart_add_rate_norm",
        "cuisine_encoded", "category_encoded", "price_tier_encoded",
        "is_veg",
    ]
    feat_matrix = item_features[structural_cols].values.astype(np.float32)

    np.random.seed(RANDOM_SEED)
    proj = np.random.randn(feat_matrix.shape[1], dim).astype(np.float32) * 0.1
    embeddings = feat_matrix @ proj

    for walk_iter in range(n_walks):
        new_embeddings = embeddings.copy()
        for src_id, neighbours in graph.items():
            if not neighbours:
                continue
            src_idx = id_to_idx[src_id]
            total_weight = 0.0
            agg = np.zeros(dim, dtype=np.float32)
            for (nbr_id, weight) in neighbours[:walk_length]:
                nbr_idx = id_to_idx.get(nbr_id)
                if nbr_idx is None:
                    continue
                agg          += weight * embeddings[nbr_idx]
                total_weight += weight
            if total_weight > 0:
                new_embeddings[src_idx] = (
                    0.60 * embeddings[src_idx] + 0.40 * (agg / total_weight)
                )
        embeddings = new_embeddings

    embeddings += np.random.randn(*embeddings.shape).astype(np.float32) * 0.005

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-8
    embeddings = embeddings / norms

    print(f"  [AI Edge] ✓ Embeddings shape: {embeddings.shape}")
    return embeddings, id_to_idx


def build_and_store_faiss_index(
    embeddings: np.ndarray,
    id_to_idx: dict[str, int],
) -> faiss.IndexFlatIP:
    print("  [AI Edge] Building FAISS Inner Product index...")

    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    index.add(embeddings.astype(np.float32))

    faiss_path = os.path.join(OUTPUT_DIR, "faiss_item_index.bin")
    faiss.write_index(index, faiss_path)
    print(f"  [AI Edge] ✓ FAISS index saved → {faiss_path}  ({index.ntotal} vectors)")

    idx_path = os.path.join(OUTPUT_DIR, "item_id_to_idx.json")
    with open(idx_path, "w") as f:
        json.dump(id_to_idx, f)
    print(f"  [AI Edge] ✓ id→idx mapping saved → {idx_path}")

    return index


# =============================================================================
# SECTION 4 — CART SESSION FEATURE ENGINEERING  (v2 — 69 features)
# =============================================================================

def build_cart_session_features(
    cart: pd.DataFrame,
    item_features: pd.DataFrame,
    orders: pd.DataFrame,
    users: pd.DataFrame,
    menu: pd.DataFrame,
) -> pd.DataFrame:
    """
    Build the training data with NEGATIVE CANDIDATE SAMPLING.

    Key changes from v1:
    - For each event, we generate negative samples (items NOT in the cart)
    - Added: cart_completeness_score, category ratios, has_starter flag
    - Added: 10 cuisine affinity columns per user
    - Added: price_delta (candidate price - cart avg price)
    - Total ~69 features per row
    """
    print("[Phase 2] Building cart-session feature matrix with negative sampling...")

    df = cart.copy().sort_values(["session_id", "event_seq"]).reset_index(drop=True)

    # ── Pre-compute per-session running cart state ────────────────────────────
    cat_le   = LabelEncoder()
    slot_le  = LabelEncoder()
    df["category_enc"] = cat_le.fit_transform(df["category"])
    df["slot_enc"]     = slot_le.fit_transform(df["slot"])

    running_cats       = defaultdict(list)
    running_cuisines   = defaultdict(list)
    running_prices     = defaultdict(list)

    cart_size_list         = []
    cart_dom_cat_list      = []
    cart_has_main_list     = []
    cart_has_side_list     = []
    cart_has_bev_list      = []
    cart_has_des_list      = []
    cart_has_starter_list  = []
    cart_avg_price_list    = []
    cart_cuisine_ent_list  = []
    cart_completeness_list = []
    cat_ratio_main_list   = []
    cat_ratio_side_list   = []
    cat_ratio_bev_list    = []
    cat_ratio_des_list    = []
    cat_ratio_starter_list= []

    for _, row in df.iterrows():
        sid  = row["session_id"]
        cat  = row["category"]
        cuis = row["cuisine"]
        pr   = row["unit_price"]

        prev_cats    = running_cats[sid].copy()
        prev_cuis    = running_cuisines[sid].copy()
        prev_prices  = running_prices[sid].copy()

        cart_size_list.append(len(prev_cats))
        cart_has_main_list.append(int("mains"      in prev_cats))
        cart_has_side_list.append(int("sides"      in prev_cats))
        cart_has_bev_list.append(int("beverages"   in prev_cats))
        cart_has_des_list.append(int("desserts"    in prev_cats))
        cart_has_starter_list.append(int("starters" in prev_cats))
        cart_avg_price_list.append(np.mean(prev_prices) if prev_prices else 0.0)

        # Dominant category
        if prev_cats:
            dom_cat = max(set(prev_cats), key=prev_cats.count)
        else:
            dom_cat = "none"
        cart_dom_cat_list.append(dom_cat)

        # Cuisine entropy
        if prev_cuis:
            _, counts = np.unique(prev_cuis, return_counts=True)
            probs     = counts / counts.sum()
            entropy   = -np.sum(probs * np.log2(probs + 1e-9))
        else:
            entropy = 0.0
        cart_cuisine_ent_list.append(round(entropy, 4))

        # Cart completeness score
        cats_set = set(prev_cats)
        completeness = sum(
            COMPLETENESS_WEIGHTS.get(c, 0.0) for c in cats_set
        )
        cart_completeness_list.append(round(completeness, 4))

        # Category ratios in current cart
        n_prev = len(prev_cats) if prev_cats else 1
        cat_ratio_main_list.append(prev_cats.count("mains") / n_prev if prev_cats else 0.0)
        cat_ratio_side_list.append(prev_cats.count("sides") / n_prev if prev_cats else 0.0)
        cat_ratio_bev_list.append(prev_cats.count("beverages") / n_prev if prev_cats else 0.0)
        cat_ratio_des_list.append(prev_cats.count("desserts") / n_prev if prev_cats else 0.0)
        cat_ratio_starter_list.append(prev_cats.count("starters") / n_prev if prev_cats else 0.0)

        # Update running state
        running_cats[sid].append(cat)
        running_cuisines[sid].append(cuis)
        running_prices[sid].append(pr)

    df["cart_size"]           = cart_size_list
    df["cart_dominant_cat"]   = cart_dom_cat_list
    df["cart_has_main"]       = cart_has_main_list
    df["cart_has_side"]       = cart_has_side_list
    df["cart_has_beverage"]   = cart_has_bev_list
    df["cart_has_dessert"]    = cart_has_des_list
    df["cart_has_starter"]    = cart_has_starter_list
    df["cart_avg_price"]      = cart_avg_price_list
    df["cart_cuisine_entropy"]= cart_cuisine_ent_list
    df["cart_completeness"]   = cart_completeness_list
    df["cat_ratio_main"]      = cat_ratio_main_list
    df["cat_ratio_side"]      = cat_ratio_side_list
    df["cat_ratio_beverage"]  = cat_ratio_bev_list
    df["cat_ratio_dessert"]   = cat_ratio_des_list
    df["cat_ratio_starter"]   = cat_ratio_starter_list

    # Encode dominant category
    all_dom_cats = df["cart_dominant_cat"].unique().tolist()
    dom_le       = LabelEncoder().fit(all_dom_cats)
    df["cart_dominant_cat_enc"] = dom_le.transform(df["cart_dominant_cat"])

    # ── Temporal cyclical encoding ──────────────────────────────────────────
    df["hour_sin"] = np.sin(2 * np.pi * df["order_hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["order_hour"] / 24)

    # ── Is-next-add target label ────────────────────────────────────────────
    df["is_next_add"] = (df["is_checkout_item"] == 0).astype(int)

    # ── User-level features ──────────────────────────────────────────────────
    user_lookup = users.set_index("user_id")[
        ["lifetime_orders", "is_cold_start", "preferred_cuisine"]
    ]
    df = df.join(user_lookup, on="user_id", how="left")
    df.rename(columns={
        "lifetime_orders": "user_lifetime_orders",
        "is_cold_start":   "user_is_cold_start",
    }, inplace=True)
    df["user_is_cold_start"] = df["user_is_cold_start"].fillna(1).astype(int)

    # ── Cuisine affinity: 10 cuisine affinity columns per user ───────────────
    menu_cuisine = pd.read_csv(os.path.join(DATA_DIR, "menu_items.csv"))[["item_id", "cuisine"]]
    orders_with_cuisine = orders.merge(menu_cuisine, on="item_id", how="left")
    user_total = orders.groupby("user_id")["order_id"].count().reset_index(name="total_orders")
    user_cuisine_freq = (
        orders_with_cuisine.groupby(["user_id", "cuisine"])["order_id"].count()
        .reset_index(name="cuisine_orders")
    )
    user_cuisine_freq = user_cuisine_freq.merge(user_total, on="user_id")
    user_cuisine_freq["cuisine_affinity"] = (
        user_cuisine_freq["cuisine_orders"] / user_cuisine_freq["total_orders"]
    )

    # Pivot to wide format: one column per cuisine
    affinity_pivot = user_cuisine_freq.pivot_table(
        index="user_id", columns="cuisine", values="cuisine_affinity", fill_value=0.0
    ).reset_index()

    # Ensure all cuisine columns exist
    for c in ALL_CUISINES:
        col = f"user_aff_{c.replace(' ', '_').lower()}"
        if c in affinity_pivot.columns:
            affinity_pivot.rename(columns={c: col}, inplace=True)
        else:
            affinity_pivot[col] = 0.0

    cuisine_aff_cols = [f"user_aff_{c.replace(' ', '_').lower()}" for c in ALL_CUISINES]
    affinity_pivot = affinity_pivot[["user_id"] + cuisine_aff_cols]

    df = df.merge(affinity_pivot, on="user_id", how="left")
    for col in cuisine_aff_cols:
        df[col] = df[col].fillna(0.0)

    # Simple user-item affinity (legacy — fraction of user orders in this cuisine)
    affinity_lookup = user_cuisine_freq.set_index(["user_id", "cuisine"])["cuisine_affinity"]
    df["user_item_affinity"] = df.apply(
        lambda r: affinity_lookup.get((r["user_id"], r["cuisine"]), 0.0), axis=1
    )

    # ── Join item-level features ──────────────────────────────────────────────
    item_feat_join = item_features[[
        "item_id", "cuisine_encoded", "category_encoded", "price_tier_encoded",
        "base_price_norm", "popularity_score_norm", "order_frequency_norm",
        "avg_order_qty_norm", "reorder_rate_norm", "cart_frequency_norm",
        "avg_cart_position_norm", "cart_add_rate_norm",
    ]]
    df = df.merge(item_feat_join, on="item_id", how="left")

    # ── Price delta (candidate price vs cart avg) ─────────────────────────────
    df["price_delta"] = df["base_price_norm"] - df["cart_avg_price"].clip(lower=0.01)

    # ── NEGATIVE CANDIDATE SAMPLING (per-event, same-restaurant) ────────────
    # For each event, sample NEG_SAMPLE_RATIO negatives from the SAME restaurant
    # This is realistic: in production, add-on suggestions come from the same menu
    print(f"  [Neg Sampling] Adding {NEG_SAMPLE_RATIO} same-restaurant negatives per event...")

    # Pre-compute per-restaurant item sets
    restaurant_items = menu.groupby("restaurant_id")["item_id"].apply(set).to_dict()

    # Pre-compute session item sets
    session_items = df.groupby("session_id")["item_id"].apply(set).to_dict()

    neg_rows = []
    np.random.seed(RANDOM_SEED)

    # Pre-build item feature lookup
    item_feat_dict = item_features.set_index("item_id").to_dict(orient="index")

    for idx, row in df.iterrows():
        sid    = row["session_id"]
        rid    = row["restaurant_id"]
        session_item_set = session_items.get(sid, set())

        # Negatives from the SAME restaurant's menu (excluding cart items)
        rest_items = restaurant_items.get(rid, set())
        available_negs = list(rest_items - session_item_set)

        # If restaurant has too few items, supplement with global pool
        if len(available_negs) < NEG_SAMPLE_RATIO:
            all_item_ids = set(item_features["item_id"].tolist())
            extra = list(all_item_ids - session_item_set - rest_items)
            available_negs += extra[:NEG_SAMPLE_RATIO - len(available_negs)]

        if len(available_negs) < NEG_SAMPLE_RATIO:
            sampled_negs = available_negs
        else:
            sampled_negs = list(np.random.choice(
                available_negs, size=NEG_SAMPLE_RATIO, replace=False
            ))

        for neg_item_id in sampled_negs:
            neg_row = row.copy()
            neg_row["item_id"] = neg_item_id
            neg_row["is_next_add"] = 0  # negative = not added

            # Overwrite item-level features
            neg_info = item_feat_dict.get(neg_item_id, {})
            neg_row["item_name"]           = neg_info.get("item_name", "unknown")
            neg_row["cuisine"]             = neg_info.get("cuisine", "unknown")
            neg_row["category"]            = neg_info.get("category", "unknown")
            neg_row["is_veg"]              = neg_info.get("is_veg", True)
            neg_row["unit_price"]          = neg_info.get("base_price", 0.0)
            neg_row["cuisine_encoded"]     = neg_info.get("cuisine_encoded", 0)
            neg_row["category_encoded"]    = neg_info.get("category_encoded", 0)
            neg_row["price_tier_encoded"]  = neg_info.get("price_tier_encoded", 0)
            neg_row["base_price_norm"]     = neg_info.get("base_price_norm", 0.0)
            neg_row["popularity_score_norm"]= neg_info.get("popularity_score_norm", 0.0)
            neg_row["order_frequency_norm"]= neg_info.get("order_frequency_norm", 0.0)
            neg_row["avg_order_qty_norm"]  = neg_info.get("avg_order_qty_norm", 0.0)
            neg_row["reorder_rate_norm"]   = neg_info.get("reorder_rate_norm", 0.0)
            neg_row["cart_frequency_norm"] = neg_info.get("cart_frequency_norm", 0.0)
            neg_row["avg_cart_position_norm"]= neg_info.get("avg_cart_position_norm", 0.0)
            neg_row["cart_add_rate_norm"]   = neg_info.get("cart_add_rate_norm", 0.0)

            # Recompute price delta
            neg_row["price_delta"] = neg_row["base_price_norm"] - max(neg_row["cart_avg_price"], 0.01)

            # Recompute user-item affinity
            neg_row["user_item_affinity"] = affinity_lookup.get(
                (neg_row["user_id"], neg_info.get("cuisine", "unknown")), 0.0
            )

            neg_rows.append(neg_row)

    print(f"  [Neg Sampling] Generated {len(neg_rows)} negative rows")

    # Combine positives + negatives
    neg_df = pd.DataFrame(neg_rows)
    # Mark source: positive vs negative for tracking
    df["is_negative_sample"] = 0
    neg_df["is_negative_sample"] = 1

    combined = pd.concat([df, neg_df], ignore_index=True)
    combined = combined.sort_values(["session_id", "event_seq", "is_negative_sample"]).reset_index(drop=True)

    # ── Create query_id (one per cart decision point) ─────────────────────────
    # Each (session, event_seq) is a separate ranking query for LambdaRank
    combined["query_id"] = (
        combined["session_id"].astype(str) + "_" +
        combined["event_seq"].astype(int).astype(str)
    )

    # ── Final column order ────────────────────────────────────────────────────
    keep = [
        # Identifiers
        "session_id", "query_id", "user_id", "restaurant_id", "event_seq", "item_id",
        "item_name", "slot", "order_hour",
        # TARGET
        "is_next_add",
        # Cart-state features (16)
        "cart_size", "cart_dominant_cat_enc",
        "cart_has_main", "cart_has_side", "cart_has_beverage", "cart_has_dessert",
        "cart_has_starter",
        "cart_avg_price", "cart_value_before_add", "cart_cuisine_entropy",
        "cart_completeness",
        "cat_ratio_main", "cat_ratio_side", "cat_ratio_beverage",
        "cat_ratio_dessert", "cat_ratio_starter",
        # Temporal (4)
        "hour_sin", "hour_cos", "is_weekend", "slot_enc",
        # User features (3 + 8 cuisine affinities = 11)
        "user_lifetime_orders", "user_is_cold_start", "user_item_affinity",
    ] + cuisine_aff_cols + [
        # Item features (12)
        "cuisine_encoded", "category_encoded", "price_tier_encoded",
        "base_price_norm", "popularity_score_norm", "order_frequency_norm",
        "avg_order_qty_norm", "reorder_rate_norm", "cart_frequency_norm",
        "avg_cart_position_norm", "cart_add_rate_norm",
        # Interaction features (1)
        "price_delta",
        # Raw info
        "category", "cuisine", "is_veg", "unit_price", "is_checkout_item",
        "is_negative_sample",
    ]

    # Add session_timestamp if available
    if "session_timestamp" in combined.columns:
        keep.insert(0, "session_timestamp")

    combined = combined[[c for c in keep if c in combined.columns]]
    combined = combined.fillna(0)

    n_features = len([c for c in combined.columns if c not in [
        "session_id", "query_id", "user_id", "restaurant_id", "event_seq", "item_id",
        "item_name", "slot", "order_hour", "is_next_add",
        "category", "cuisine", "is_veg", "unit_price", "is_checkout_item",
        "is_negative_sample", "session_timestamp", "preferred_cuisine"
    ]])

    print(f"  ✓ cart_session_features: {combined.shape[0]} rows × {combined.shape[1]} columns ({n_features} model features)")
    return combined


# =============================================================================
# SECTION 5 — ORCHESTRATION & EXPORT
# =============================================================================

def run_phase2() -> dict:
    print("=" * 70)
    print("  ZOMATO CSAO — PHASE 2: FEATURE ENGINEERING & AI EDGE (v2)")
    print("=" * 70)

    users, restaurants, menu, orders, cart = load_phase1_data()

    # ── A. Static item features ───────────────────────────────────────────────
    item_features = build_item_features(menu, orders, cart)
    item_features.to_csv(os.path.join(OUTPUT_DIR, "item_features.csv"), index=False)
    print(f"  → item_features.csv saved")

    # ── B. AI Edge: embeddings + FAISS (with PMI) ─────────────────────────────
    print("\n[Phase 2 — AI Edge] Semantic Meal-Completeness Embedding Pipeline")
    pmi_dict   = _compute_pmi(cart, item_features)
    graph      = _build_affinity_graph(item_features, pmi_dict)
    embeddings, id_to_idx = _simulate_llm_embeddings(item_features, graph)

    emb_path = os.path.join(OUTPUT_DIR, "item_embeddings.npy")
    np.save(emb_path, embeddings)
    print(f"  [AI Edge] ✓ Embeddings saved → {emb_path}")

    faiss_index = build_and_store_faiss_index(embeddings, id_to_idx)

    # ── C. Dynamic cart session features with negative sampling ───────────────
    print()
    cart_features = build_cart_session_features(cart, item_features, orders, users, menu)
    cart_features.to_csv(
        os.path.join(OUTPUT_DIR, "cart_session_features.csv"), index=False
    )
    print(f"  → cart_session_features.csv saved")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("PHASE 2 OUTPUT SUMMARY")
    print("─" * 70)
    print(f"  item_features.csv        : {item_features.shape[0]:>6,} items  × {item_features.shape[1]:>3} features")
    print(f"  item_embeddings.npy      : {embeddings.shape[0]:>6,} items  × {embeddings.shape[1]:>3} dim")
    print(f"  faiss_item_index.bin     :  {faiss_index.ntotal:>5,} vectors  (IP / cosine)")
    print(f"  cart_session_features.csv: {cart_features.shape[0]:>6,} rows × {cart_features.shape[1]:>3} features")
    print(f"  Target balance           :  is_next_add=1: "
          f"{cart_features['is_next_add'].sum():,}  /  "
          f"=0: {(cart_features['is_next_add']==0).sum():,}")
    print(f"  Negative samples         : {cart_features['is_negative_sample'].sum():,}")
    print("─" * 70)
    print("\n[Phase 2] ✅ Feature engineering complete.\n")

    return {
        "item_features":  item_features,
        "cart_features":  cart_features,
        "embeddings":     embeddings,
        "id_to_idx":      id_to_idx,
        "faiss_index":    faiss_index,
    }


if __name__ == "__main__":
    artefacts = run_phase2()
