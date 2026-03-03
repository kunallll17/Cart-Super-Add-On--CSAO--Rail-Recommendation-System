
import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from itertools import product

# ── Reproducibility ──────────────────────────────────────────────────────────
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# ── Output directory ──────────────────────────────────────────────────────────
OUTPUT_DIR = "data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =============================================================================
# SECTION 1 — CATALOGUE CONSTANTS  (expanded)
# =============================================================================

CUISINE_ITEMS = {
    "North Indian": {
        "mains":      ["Butter Chicken", "Dal Makhani", "Paneer Tikka Masala",
                        "Shahi Paneer", "Mutton Rogan Josh", "Chole Bhature",
                        "Rajma Chawal", "Kadai Chicken", "Palak Paneer",
                        "Matar Paneer", "Dum Aloo", "Aloo Gobi",
                        "Malai Kofta", "Chicken Korma"],
        "starters":   ["Paneer Tikka", "Chicken Tikka", "Seekh Kebab",
                        "Fish Tikka", "Hara Bhara Kebab", "Tandoori Chicken",
                        "Dahi Kebab", "Amritsari Fish"],
        "sides":      ["Garlic Naan", "Butter Roti", "Paratha", "Tandoori Roti",
                        "Laccha Paratha", "Missi Roti", "Rumali Roti",
                        "Cheese Naan", "Onion Kulcha"],
        "beverages":  ["Lassi", "Sweet Lassi", "Salted Lassi", "Mango Lassi",
                        "Chai", "Cold Coffee", "Masala Chaas",
                        "Thandai", "Rooh Afza"],
        "desserts":   ["Gulab Jamun", "Rasgulla", "Kheer", "Gajar Halwa",
                        "Jalebi", "Kulfi", "Rabri", "Malpua"],
    },
    "South Indian": {
        "mains":      ["Masala Dosa", "Plain Dosa", "Uttapam", "Idli Sambar",
                        "Medu Vada", "Pongal", "Pesarattu",
                        "Chettinad Chicken Curry", "Appam with Stew",
                        "Neer Dosa", "Rava Dosa", "Set Dosa"],
        "starters":   ["Chicken 65", "Gobi 65", "Paneer 65",
                        "Sundal", "Bonda"],
        "sides":      ["Coconut Chutney", "Tomato Chutney", "Sambar", "Rasam",
                        "Papad", "Pickle", "Gunpowder Podi",
                        "Onion Raita", "Curd Rice"],
        "beverages":  ["Filter Coffee", "Buttermilk", "Tender Coconut Water",
                        "Rose Milk", "Neera", "Jigarthanda",
                        "Panagam", "Nannari Sarbat"],
        "desserts":   ["Payasam", "Badam Halwa", "Mysore Pak",
                        "Rava Kesari", "Paal Payasam"],
    },
    "Biryani": {
        "mains":      ["Chicken Biryani", "Mutton Biryani", "Veg Biryani",
                        "Egg Biryani", "Hyderabadi Biryani", "Lucknawi Biryani",
                        "Prawn Biryani", "Paneer Biryani",
                        "Lamb Biryani", "Chicken Dum Biryani",
                        "Kacchi Biryani", "Thalassery Biryani"],
        "starters":   ["Chicken Lollipop", "Tangdi Kebab",
                        "Mutton Seekh",  "Keema Samosa",
                        "Reshmi Kebab"],
        "sides":      ["Raita", "Mirchi Ka Salan", "Shorba", "Brinjal Salan",
                        "Boiled Egg", "Tamatar Chutney", "Onion Raita",
                        "Mixed Pickle"],
        "beverages":  ["Coca-Cola", "Sprite", "Limca", "Thums Up", "Fanta",
                        "Cold Lassi", "Rooh Afza Sharbat",
                        "Jaljeera", "Butter Milk"],
        "desserts":   ["Double Ka Meetha", "Shahi Tukda", "Phirni",
                        "Qubani Ka Meetha", "Seviyan Kheer"],
    },
    "Street Food": {
        "mains":      ["Pav Bhaji", "Vada Pav", "Samosa", "Bhel Puri",
                        "Sev Puri", "Dahi Puri", "Pani Puri", "Aloo Tikki",
                        "Kathi Roll", "Frankie", "Dabeli",
                        "Chole Kulche", "Ram Ladoo", "Poha"],
        "starters":   ["Corn Chat", "Papdi Chaat", "Ragda Pattice",
                        "Aloo Chaat", "Pani Puri Shots"],
        "sides":      ["Green Chutney", "Tamarind Chutney", "Onion Rings",
                        "Sev", "Papad", "Masala Peanuts"],
        "beverages":  ["Nimbu Pani", "Ganne Ka Juice", "Jaljeera", "Aam Panna",
                        "Kokum Sharbat", "Kanji", "Sol Kadhi"],
        "desserts":   ["Kulfi Falooda", "Rabri", "Matka Kulfi",
                        "Gola", "Mawa Jalebi"],
    },
    "Fast Food": {
        "mains":      ["Chicken Burger", "Veg Burger", "McAloo Tikki",
                        "Crispy Chicken Wrap", "Margherita Pizza",
                        "Paneer Tikka Pizza", "Chicken Pizza", "French Fries",
                        "Loaded Fries", "Chicken Shawarma",
                        "Hot Dog", "Grilled Sandwich"],
        "starters":   ["Chicken Nuggets", "Mozzarella Sticks",
                        "Potato Wedges", "Cheese Balls",
                        "Jalapeno Poppers"],
        "sides":      ["Coleslaw", "Garlic Bread", "Pasta", "Dip Sauces",
                        "Cheese Dip", "Ranch Sauce"],
        "beverages":  ["Pepsi", "Mountain Dew", "7UP", "Iced Tea",
                        "Mango Smoothie", "Strawberry Milkshake",
                        "Cold Coffee Frappe", "Lime Soda"],
        "desserts":   ["Brownie", "Cheesecake", "Choco Lava Cake", "Oreo McFlurry",
                        "Sundae", "Donut"],
    },
    "Chinese": {
        "mains":      ["Fried Rice", "Chilli Chicken", "Manchurian",
                        "Schezwan Noodles", "Hakka Noodles",
                        "Kung Pao Chicken", "Sweet and Sour Chicken",
                        "Paneer Chilli", "Veg Manchurian"],
        "starters":   ["Spring Rolls", "Dim Sum", "Crispy Corn",
                        "Honey Chilli Potato", "Dragon Chicken",
                        "Lotus Stem Chips"],
        "sides":      ["Manchow Soup", "Hot and Sour Soup", "Wonton Soup",
                        "Szechuan Sauce", "Soy Sauce Dip"],
        "beverages":  ["Green Tea", "Jasmine Tea", "Lemon Tea",
                        "Cold Coffee", "Coca-Cola"],
        "desserts":   ["Fried Ice Cream", "Date Pancake", "Toffee Apple"],
    },
    "Beverages": {
        "mains":      ["Watermelon Juice", "Mixed Fruit Juice", "Orange Juice",
                        "Mosambi Juice", "Sugarcane Juice", "Green Tea",
                        "Matcha Latte", "Cold Brew Coffee",
                        "ABC Juice", "Kiwi Smoothie"],
        "starters":   [],
        "sides":      [],
        "beverages":  [],
        "desserts":   [],
    },
    "Desserts": {
        "mains":      ["Chocolate Fondue", "Mango Cheesecake", "Red Velvet Cake",
                        "Tiramisu", "Soufflé", "Panna Cotta", "Waffles",
                        "Pancakes", "Crème Brûlée", "Tres Leches",
                        "Banana Split"],
        "starters":   [],
        "sides":      [],
        "beverages":  ["Hot Chocolate", "Warm Milk", "Vanilla Shake"],
        "desserts":   [],
    },
}

# ── Non-veg keywords ──────────────────────────────────────────────────────────
NON_VEG_KEYWORDS = [
    "chicken", "mutton", "prawn", "egg", "meat", "fish", "keema",
    "seekh", "lamb", "crab", "tangdi", "reshmi"
]

# ── Price bands per category ──────────────────────────────────────────────────
PRICE_BANDS = {
    "mains":      (149, 549),
    "starters":   (99, 329),
    "sides":      (49, 199),
    "beverages":  (39, 149),
    "desserts":   (79, 299),
}

# ── Category distribution targets: main 35%, bev 25%, side 20%, dessert 10%, starter 10%
CATEGORY_WEIGHTS = {
    "mains":     0.35,
    "beverages": 0.25,
    "sides":     0.20,
    "desserts":  0.10,
    "starters":  0.10,
}

# ── Restaurant name fragments ────────────────────────────────────────────────
REST_PREFIXES = [
    "Hotel", "Shree", "Swad", "Zaika", "Dum", "Spice", "Royal",
    "Punjab", "Dilli", "Bombay", "Mumbai", "Madras", "Chennai",
    "Hyderabad", "Paradise", "Baba", "Mama", "Aroma", "Biryani",
    "Sagar", "Anand", "Golden", "Silver", "Diamond",
]
REST_SUFFIXES = [
    "House", "Kitchen", "Restaurant", "Dhaba", "Express", "Corner",
    "Palace", "Hub", "Garden", "Point", "Zone", "Bites",
    "Junction", "Lounge", "Cafe",
]

# ── City names ────────────────────────────────────────────────────────────────
CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune",
    "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Indore"
]

# ── Meal-time slot definitions ────────────────────────────────────────────────
TIME_SLOTS = {
    "Breakfast":   (7, 10),
    "Lunch":       (12, 15),
    "Tea-Time":    (16, 18),
    "Dinner":      (19, 22),
    "Late-Night":  (23, 2),
}

# ── "Complete Meal" affinities ────────────────────────────────────────────────
MEAL_AFFINITY = {
    "Biryani":      [("sides", "Raita"), ("sides", "Mirchi Ka Salan"),
                     ("beverages", "Coca-Cola"), ("beverages", "Cold Lassi"),
                     ("starters", "Chicken Lollipop")],
    "North Indian": [("sides", "Garlic Naan"), ("sides", "Butter Roti"),
                     ("beverages", "Lassi"), ("desserts", "Gulab Jamun"),
                     ("starters", "Paneer Tikka")],
    "South Indian": [("sides", "Coconut Chutney"), ("sides", "Sambar"),
                     ("beverages", "Filter Coffee"), ("beverages", "Buttermilk"),
                     ("starters", "Chicken 65")],
    "Street Food":  [("sides", "Green Chutney"), ("sides", "Tamarind Chutney"),
                     ("beverages", "Nimbu Pani"), ("starters", "Papdi Chaat")],
    "Fast Food":    [("sides", "Coleslaw"), ("sides", "Garlic Bread"),
                     ("beverages", "Pepsi"), ("desserts", "Choco Lava Cake"),
                     ("starters", "Chicken Nuggets")],
    "Chinese":      [("sides", "Manchow Soup"), ("beverages", "Green Tea"),
                     ("starters", "Spring Rolls"), ("starters", "Dim Sum")],
    "Beverages":    [],
    "Desserts":     [("beverages", "Hot Chocolate"), ("beverages", "Warm Milk")],
}


# =============================================================================
# SECTION 2 — USER GENERATION
# =============================================================================

def generate_users(n_users: int = 500) -> pd.DataFrame:
    """Generate a realistic user table with demographic and behavioural attributes."""
    print(f"[Phase 1] Generating {n_users} users...")

    reference_date = datetime(2026, 3, 2)

    ages = np.random.choice(
        range(18, 56),
        size=n_users,
        p=np.array([
            *[3.5] * 18,   # 18-35 → heavy
            *[1.0] * 20    # 36-55 → lighter
        ]) / (3.5 * 18 + 1.0 * 20)
    )

    is_veg = np.random.choice([True, False], size=n_users, p=[0.40, 0.60])

    cuisines = list(CUISINE_ITEMS.keys())
    preferred_cuisines = np.random.choice(cuisines, size=n_users)

    # Cold-start: ~15% new users
    is_cold_start = np.random.choice([True, False], size=n_users, p=[0.15, 0.85])

    def random_join_date(cold: bool) -> str:
        if cold:
            days_back = random.randint(1, 30)
        else:
            days_back = random.randint(31, 365 * 3)
        return (reference_date - timedelta(days=days_back)).strftime("%Y-%m-%d")

    join_dates = [random_join_date(c) for c in is_cold_start]

    lifetime_orders = [
        random.randint(0, 2) if c else random.randint(3, 200)
        for c in is_cold_start
    ]

    users_df = pd.DataFrame({
        "user_id":            [f"U{str(i).zfill(4)}" for i in range(1, n_users + 1)],
        "city":               np.random.choice(CITIES, size=n_users),
        "age":                ages,
        "gender":             np.random.choice(["M", "F", "Other"], size=n_users,
                                               p=[0.55, 0.43, 0.02]),
        "is_veg_preference":  is_veg,
        "preferred_cuisine":  preferred_cuisines,
        "lifetime_orders":    lifetime_orders,
        "is_cold_start":      is_cold_start,
        "join_date":          join_dates,
    })

    print(f"  ✓ {len(users_df)} users | cold-start: {is_cold_start.sum()}")
    return users_df


# =============================================================================
# SECTION 3 — RESTAURANT GENERATION
# =============================================================================

def generate_restaurants(n_restaurants: int = 80) -> pd.DataFrame:
    """Generate restaurant metadata (expanded from 50 to 80)."""
    print(f"[Phase 1] Generating {n_restaurants} restaurants...")

    cuisines = list(CUISINE_ITEMS.keys())
    cold_flags = np.random.choice([True, False], size=n_restaurants, p=[0.10, 0.90])

    names = [
        f"{random.choice(REST_PREFIXES)} {random.choice(REST_SUFFIXES)}"
        for _ in range(n_restaurants)
    ]

    ratings = []
    for cold in cold_flags:
        if cold:
            ratings.append(np.nan)
        else:
            ratings.append(round(random.uniform(3.0, 5.0), 1))

    price_buckets = np.random.choice(
        ["Budget", "Mid", "Premium"], size=n_restaurants, p=[0.40, 0.45, 0.15]
    )

    rest_df = pd.DataFrame({
        "restaurant_id":            [f"R{str(i).zfill(3)}" for i in range(1, n_restaurants + 1)],
        "name":                     names,
        "city":                     np.random.choice(CITIES, size=n_restaurants),
        "primary_cuisine":          np.random.choice(cuisines, size=n_restaurants),
        "avg_rating":               ratings,
        "price_bucket":             price_buckets,
        "is_cold_start_restaurant": cold_flags,
        "is_pure_veg":              np.random.choice([True, False], size=n_restaurants,
                                                     p=[0.25, 0.75]),
    })

    print(f"  ✓ {len(rest_df)} restaurants | cold-start: {cold_flags.sum()}")
    return rest_df


# =============================================================================
# SECTION 4 — MENU ITEM GENERATION  (target: ~813 items)
# =============================================================================

def _is_item_nonveg(item_name: str) -> bool:
    lower = item_name.lower()
    return any(kw in lower for kw in NON_VEG_KEYWORDS)


def generate_menu_items(
    restaurants_df: pd.DataFrame,
    target_total_items: int = 820
) -> pd.DataFrame:
    """
    Generate an expanded menu catalogue (~813 items).
    More cross-cuisine items and starters included.
    """
    print(f"[Phase 1] Generating ≈{target_total_items} menu items...")

    records = []
    item_counter = 1

    items_per_restaurant = max(1, target_total_items // len(restaurants_df))

    for _, rest in restaurants_df.iterrows():
        rest_id  = rest["restaurant_id"]
        cuisine  = rest["primary_cuisine"]

        def pool_for_cuisine(c):
            cats = CUISINE_ITEMS.get(c, {})
            out = []
            for cat_name, cat_items in cats.items():
                for itm in cat_items:
                    out.append((itm, c, cat_name))
            return out

        item_pool = pool_for_cuisine(cuisine)

        # Add cross-cuisine items (2-4 random other cuisines for richer catalogue)
        other_cuisines = [c for c in CUISINE_ITEMS if c != cuisine]
        for extra_c in random.sample(other_cuisines, k=min(4, len(other_cuisines))):
            extra_pool = pool_for_cuisine(extra_c)
            item_pool += random.sample(extra_pool,
                                       k=min(4, len(extra_pool)))

        random.shuffle(item_pool)
        selected = item_pool[:items_per_restaurant]

        for (item_name, item_cuisine, category) in selected:
            price_lo, price_hi = PRICE_BANDS.get(category, (99, 299))
            base_price = round(
                random.uniform(price_lo, price_hi) * random.uniform(0.90, 1.10), -1
            )

            is_veg = not _is_item_nonveg(item_name)
            if rest["is_pure_veg"] and not is_veg:
                continue

            pop_score = round(
                np.clip(np.random.beta(a=1.5, b=5), 0.01, 0.99), 3
            )

            records.append({
                "item_id":          f"I{str(item_counter).zfill(5)}",
                "restaurant_id":    rest_id,
                "item_name":        item_name,
                "cuisine":          item_cuisine,
                "category":         category,
                "is_veg":           is_veg,
                "base_price":       float(base_price),
                "popularity_score": pop_score,
                "is_available":     np.random.choice([True, False], p=[0.95, 0.05]),
            })
            item_counter += 1

    menu_df = pd.DataFrame(records)
    print(f"  ✓ {len(menu_df)} menu items across {len(restaurants_df)} restaurants")
    # Print category distribution
    if len(menu_df) > 0:
        cat_dist = menu_df["category"].value_counts(normalize=True).round(3)
        print(f"  Category distribution:\n{cat_dist.to_string()}")
    return menu_df


# =============================================================================
# SECTION 5 — HISTORICAL ORDERS  (target: ~8,600)
# =============================================================================

def _sample_time(slot: str) -> tuple:
    lo, hi = TIME_SLOTS[slot]
    if lo > hi:
        hour = random.choice(list(range(lo, 24)) + list(range(0, hi + 1)))
    else:
        hour = random.randint(lo, hi)
    minute = random.randint(0, 59)
    is_weekend = random.random() < 0.35
    return hour, minute, is_weekend


def generate_historical_orders(
    users_df: pd.DataFrame,
    restaurants_df: pd.DataFrame,
    menu_df: pd.DataFrame,
    n_orders: int = 8_600,
) -> pd.DataFrame:
    """Generate flat historical order lines."""
    print(f"[Phase 1] Generating ≈{n_orders} historical orders...")

    reference_date = datetime(2026, 3, 2)

    rest_menu = {
        rid: grp for rid, grp in menu_df[menu_df["is_available"]].groupby("restaurant_id")
    }

    slot_weights = {
        "Breakfast":  0.10,
        "Lunch":      0.30,
        "Tea-Time":   0.08,
        "Dinner":     0.40,
        "Late-Night": 0.12,
    }
    slots      = list(slot_weights.keys())
    slot_probs = list(slot_weights.values())

    rest_by_cuisine = {
        c: restaurants_df[restaurants_df["primary_cuisine"] == c]["restaurant_id"].tolist()
        for c in restaurants_df["primary_cuisine"].unique()
    }

    records   = []
    order_counter = 1

    for _, user in users_df.iterrows():
        user_id = user["user_id"]

        if user["is_cold_start"]:
            n_user_orders = random.choices([0, 1, 2], weights=[0.4, 0.4, 0.2])[0]
        else:
            n_user_orders = min(user["lifetime_orders"],
                                random.randint(3, 60))

        for _ in range(n_user_orders):
            slot = random.choices(slots, weights=slot_probs)[0]
            hour, minute, is_weekend = _sample_time(slot)

            pref_cuisine = user["preferred_cuisine"]
            if random.random() < 0.70 and rest_by_cuisine.get(pref_cuisine):
                rest_id = random.choice(rest_by_cuisine[pref_cuisine])
            else:
                rest_id = random.choice(restaurants_df["restaurant_id"].tolist())

            menu_slice = rest_menu.get(rest_id)
            if menu_slice is None or menu_slice.empty:
                continue

            n_items = random.choices([1, 2, 3, 4, 5], weights=[5, 30, 35, 20, 10])[0]
            chosen = menu_slice.sample(
                n=min(n_items, len(menu_slice)),
                weights="popularity_score",
                replace=False,
            )

            days_back = random.randint(1, 730)
            order_date = (reference_date - timedelta(days=days_back)).strftime("%Y-%m-%d")

            order_id   = f"ORD{str(order_counter).zfill(7)}"
            order_total = 0.0

            for _, item in chosen.iterrows():
                qty        = random.choices([1, 2], weights=[85, 15])[0]
                unit_price = item["base_price"]
                order_total += qty * unit_price

                records.append({
                    "order_id":      order_id,
                    "user_id":       user_id,
                    "restaurant_id": rest_id,
                    "item_id":       item["item_id"],
                    "item_name":     item["item_name"],
                    "quantity":      qty,
                    "unit_price":    unit_price,
                    "order_date":    order_date,
                    "order_hour":    hour,
                    "slot":          slot,
                    "is_weekend":    is_weekend,
                    "order_total":   round(order_total, 2),
                })
            order_counter += 1

            if order_counter > n_orders:
                break
        if order_counter > n_orders:
            break

    orders_df = pd.DataFrame(records)
    print(f"  ✓ {len(orders_df)} order-lines across {orders_df['order_id'].nunique()} orders")
    return orders_df


# =============================================================================
# SECTION 6 — CART SESSION TRANSITIONS  (target: ~48,000 events)
# =============================================================================

def generate_cart_sessions(
    users_df: pd.DataFrame,
    restaurants_df: pd.DataFrame,
    menu_df: pd.DataFrame,
    n_sessions: int = 18_000,
) -> pd.DataFrame:
    """
    Generate sequential cart-add event logs.

    v2 Changes:
    - Larger session count (18K sessions → ~48K events at ~2.7 items/session)
    - Each session gets a proper timestamp for temporal ordering
    - Added starter-aware meal patterns
    """
    print(f"[Phase 1] Generating {n_sessions} cart sessions...")

    reference_date = datetime(2026, 3, 2)

    rest_menu = {
        rid: grp.reset_index(drop=True)
        for rid, grp in menu_df[menu_df["is_available"]].groupby("restaurant_id")
    }
    rest_by_cuisine = {
        c: restaurants_df[restaurants_df["primary_cuisine"] == c]["restaurant_id"].tolist()
        for c in restaurants_df["primary_cuisine"].unique()
    }

    slots      = ["Breakfast", "Lunch", "Tea-Time", "Dinner", "Late-Night"]
    slot_probs = [0.10, 0.30, 0.08, 0.40, 0.12]

    all_events = []
    session_counter = 1

    user_ids = users_df["user_id"].tolist()

    for _ in range(n_sessions):
        # ── Pick user ────────────────────────────────────────────────────────
        user_id   = random.choice(user_ids)
        user_row  = users_df[users_df["user_id"] == user_id].iloc[0]

        # ── Pick restaurant ──────────────────────────────────────────────────
        pref_cuisine = user_row["preferred_cuisine"]
        if random.random() < 0.70 and rest_by_cuisine.get(pref_cuisine):
            rest_id = random.choice(rest_by_cuisine[pref_cuisine])
        else:
            rest_id = random.choice(restaurants_df["restaurant_id"].tolist())

        menu_slice = rest_menu.get(rest_id)
        if menu_slice is None or menu_slice.empty:
            continue

        # ── Time context ─────────────────────────────────────────────────────
        slot = random.choices(slots, weights=slot_probs)[0]
        hour, _, is_weekend = _sample_time(slot)

        # ── Session timestamp (for true temporal ordering) ───────────────────
        days_back = random.randint(1, 365)
        session_ts = reference_date - timedelta(
            days=days_back, hours=random.randint(0, 23),
            minutes=random.randint(0, 59), seconds=random.randint(0, 59)
        )
        session_timestamp = session_ts.strftime("%Y-%m-%d %H:%M:%S")

        # ── Determine session pattern ─────────────────────────────────────────
        pattern = random.choices(
            ["complete_meal", "starter_meal", "impulse_beverage", "snack_only", "random"],
            weights=[0.40, 0.15, 0.15, 0.15, 0.15],
        )[0]

        session_id       = f"SESS{str(session_counter).zfill(7)}"
        cart_events      = []
        cart_value       = 0.0
        cumulative_secs  = 0

        def pick_item(cat: str, exclude_ids: set = set()) -> pd.Series | None:
            sub = menu_slice[
                (menu_slice["category"] == cat) &
                (~menu_slice["item_id"].isin(exclude_ids))
            ]
            if sub.empty:
                return None
            return sub.sample(1, weights="popularity_score").iloc[0]

        def pick_main(exclude_ids: set = set()) -> pd.Series | None:
            return pick_item("mains", exclude_ids)

        def make_event(item_row: pd.Series, seq: int, is_checkout: int) -> dict:
            nonlocal cart_value, cumulative_secs
            think_time = random.randint(5, 120)
            cumulative_secs += think_time
            unit_price = item_row["base_price"]
            ev = {
                "session_id":          session_id,
                "user_id":             user_id,
                "restaurant_id":       rest_id,
                "event_seq":           seq,
                "item_id":             item_row["item_id"],
                "item_name":           item_row["item_name"],
                "cuisine":             item_row["cuisine"],
                "category":            item_row["category"],
                "is_veg":              item_row["is_veg"],
                "unit_price":          unit_price,
                "add_time_seconds":    cumulative_secs,
                "cart_value_before_add": round(cart_value, 2),
                "slot":                slot,
                "order_hour":          hour,
                "is_weekend":          int(is_weekend),
                "is_checkout_item":    is_checkout,
                "session_timestamp":   session_timestamp,
            }
            cart_value += unit_price
            return ev

        added_ids = set()

        # ── Pattern: COMPLETE MEAL ────────────────────────────────────────────
        if pattern == "complete_meal":
            main = pick_main(added_ids)
            if main is None:
                session_counter += 1
                continue
            added_ids.add(main["item_id"])
            cart_events.append(make_event(main, 0, 0))

            if random.random() < 0.60:
                side = pick_item("sides", added_ids)
                if side is not None:
                    added_ids.add(side["item_id"])
                    cart_events.append(make_event(side, len(cart_events), 0))

            if random.random() < 0.70:
                bev = pick_item("beverages", added_ids)
                if bev is not None:
                    added_ids.add(bev["item_id"])
                    cart_events.append(make_event(bev, len(cart_events), 0))

            if random.random() < 0.25:
                des = pick_item("desserts", added_ids)
                if des is not None:
                    added_ids.add(des["item_id"])
                    cart_events.append(make_event(des, len(cart_events), 0))

        # ── Pattern: STARTER + MEAL ───────────────────────────────────────────
        elif pattern == "starter_meal":
            starter = pick_item("starters", added_ids)
            if starter is not None:
                added_ids.add(starter["item_id"])
                cart_events.append(make_event(starter, 0, 0))

            main = pick_main(added_ids)
            if main is not None:
                added_ids.add(main["item_id"])
                cart_events.append(make_event(main, len(cart_events), 0))

            if random.random() < 0.50:
                side = pick_item("sides", added_ids)
                if side is not None:
                    added_ids.add(side["item_id"])
                    cart_events.append(make_event(side, len(cart_events), 0))

            if random.random() < 0.60:
                bev = pick_item("beverages", added_ids)
                if bev is not None:
                    added_ids.add(bev["item_id"])
                    cart_events.append(make_event(bev, len(cart_events), 0))

        # ── Pattern: IMPULSE BEVERAGE ─────────────────────────────────────────
        elif pattern == "impulse_beverage":
            main = pick_main(added_ids)
            if main is None:
                session_counter += 1
                continue
            added_ids.add(main["item_id"])
            cart_events.append(make_event(main, 0, 0))

            bev = pick_item("beverages", added_ids)
            if bev is not None:
                added_ids.add(bev["item_id"])
                cart_events.append(make_event(bev, len(cart_events), 0))

        # ── Pattern: SNACK ONLY ───────────────────────────────────────────────
        elif pattern == "snack_only":
            n_snacks = random.choice([1, 2])
            for seq in range(n_snacks):
                cat = random.choice(["mains", "sides", "starters"])
                itm = pick_item(cat, added_ids)
                if itm is not None:
                    added_ids.add(itm["item_id"])
                    cart_events.append(make_event(itm, len(cart_events), 0))

        # ── Pattern: RANDOM ───────────────────────────────────────────────────
        else:
            n_random = random.randint(1, 5)
            for _ in range(n_random):
                cat = random.choice(["mains", "sides", "beverages", "desserts", "starters"])
                itm = pick_item(cat, added_ids)
                if itm is not None:
                    added_ids.add(itm["item_id"])
                    cart_events.append(make_event(itm, len(cart_events), 0))

        if not cart_events:
            session_counter += 1
            continue

        # Mark the last event as the checkout item
        cart_events[-1]["is_checkout_item"] = 1

        all_events.extend(cart_events)
        session_counter += 1

    cart_df = pd.DataFrame(all_events)
    print(
        f"  ✓ {len(cart_df)} cart-add events across "
        f"{cart_df['session_id'].nunique()} sessions"
    )
    if len(cart_df) > 0:
        print(f"  Avg items/session: {len(cart_df) / cart_df['session_id'].nunique():.2f}")
    return cart_df


# =============================================================================
# SECTION 7 — ORCHESTRATION & EXPORT
# =============================================================================

def run_phase1(
    n_users: int      = 500,
    n_restaurants: int = 80,
    n_menu_items: int  = 820,
    n_orders: int      = 8_600,
    n_sessions: int    = 18_000,
    export_csv: bool   = True,
) -> dict[str, pd.DataFrame]:
    """
    Master runner for Phase 1.
    """
    print("=" * 70)
    print("  ZOMATO CSAO — PHASE 1: DATA GENERATION (v2 — Expanded)")
    print("=" * 70)

    users_df       = generate_users(n_users)
    restaurants_df = generate_restaurants(n_restaurants)
    menu_df        = generate_menu_items(restaurants_df, n_menu_items)
    orders_df      = generate_historical_orders(users_df, restaurants_df, menu_df, n_orders)
    cart_df        = generate_cart_sessions(users_df, restaurants_df, menu_df, n_sessions)

    tables = {
        "users":             users_df,
        "restaurants":       restaurants_df,
        "menu_items":        menu_df,
        "historical_orders": orders_df,
        "cart_sessions":     cart_df,
    }

    if export_csv:
        print("\n[Phase 1] Exporting CSVs to:", os.path.abspath(OUTPUT_DIR))
        for name, df in tables.items():
            path = os.path.join(OUTPUT_DIR, f"{name}.csv")
            df.to_csv(path, index=False)
            print(f"  → {name}.csv  ({len(df):,} rows, {df.shape[1]} cols)")

    print("\n[Phase 1] ✅ Data generation complete.\n")

    # ── Quick sanity summary ──────────────────────────────────────────────────
    print("─" * 70)
    print("DATASET SUMMARY")
    print("─" * 70)
    print(f"  Users          : {len(users_df):>7,}  "
          f"(cold-start: {users_df['is_cold_start'].sum()})")
    print(f"  Restaurants    : {len(restaurants_df):>7,}  "
          f"(cold-start: {restaurants_df['is_cold_start_restaurant'].sum()})")
    print(f"  Menu Items     : {len(menu_df):>7,}  "
          f"(veg: {menu_df['is_veg'].sum()}, "
          f"non-veg: {(~menu_df['is_veg']).sum()})")
    print(f"  Order Lines    : {len(orders_df):>7,}  "
          f"({orders_df['order_id'].nunique():,} unique orders)")
    print(f"  Cart Events    : {len(cart_df):>7,}  "
          f"({cart_df['session_id'].nunique():,} sessions)")
    print("─" * 70)

    return tables


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    tables = run_phase1(
        n_users       = 500,
        n_restaurants = 80,
        n_menu_items  = 820,
        n_orders      = 8_600,
        n_sessions    = 18_000,
        export_csv    = True,
    )
