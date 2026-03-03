// ── Restaurants ───────────────────────────────────────────────────────────────
// IDs must match restaurant_id values in the backend's item_features.csv
export const RESTAURANTS = [
  {
    id: 'R003', name: 'Biryani Blues', cuisine: 'Biryani', city: 'Mumbai',
    rating: 4.2, costForTwo: 300, deliveryTime: '30-35 min',
    tags: ['North Indian', 'Biryani'],
  },
  {
    id: 'R014', name: 'The Urban Bistro', cuisine: 'Fast Food', city: 'Bangalore',
    rating: 4.0, costForTwo: 400, deliveryTime: '25-30 min',
    tags: ['Fast Food', 'Street Food', 'Cafe'],
  },
  {
    id: 'R026', name: 'The Heritage Kitchen', cuisine: 'Multi-Cuisine', city: 'Pune',
    rating: 4.3, costForTwo: 500, deliveryTime: '35-40 min',
    tags: ['South Indian', 'Desserts', 'Continental'],
  },
]

// ── Menu items ─────────────────────────────────────────────────────────────────
// Item IDs must match item_id values in the backend's FAISS index (item_features.csv).
// Using fake IDs (e.g. BW001) causes a cold-start fallback in FAISS, which returns
// random items from the training corpus (e.g. Tandoori Roti from R001).
export const MENU_ITEMS = {
  R003: [
    { id: 'I00022', name: 'Egg Biryani',    category: 'mains',     price: 340, veg: false,
      description: 'Aromatic basmati rice slow-cooked with spiced egg masala', emoji: '🍛' },
    { id: 'I00025', name: 'Lamb Biryani',   category: 'mains',     price: 270, veg: false,
      description: 'Tender lamb pieces layered with fragrant saffron rice', emoji: '🍛' },
    { id: 'I00029', name: 'Kacchi Biryani', category: 'mains',     price: 250, veg: true,
      description: 'Traditional dum-cooked biryani with whole spices', emoji: '🍛' },
    { id: 'I00024', name: 'Rajma Chawal',   category: 'mains',     price: 190, veg: true,
      description: 'Creamy kidney bean curry served with steamed rice', emoji: '🫘' },
    { id: 'I00023', name: 'Garlic Naan',    category: 'sides',     price: 90,  veg: true,
      description: 'Freshly baked flatbread with roasted garlic and butter', emoji: '🫓' },
    { id: 'I00030', name: 'Mixed Pickle',   category: 'sides',     price: 70,  veg: true,
      description: 'House-made tangy pickle blend — the perfect biryani companion', emoji: '🥒' },
    { id: 'I00021', name: 'Cold Coffee',    category: 'beverages', price: 70,  veg: true,
      description: 'Chilled creamy coffee blended with milk and ice', emoji: '☕' },
    { id: 'I00026', name: 'Sweet Lassi',    category: 'beverages', price: 100, veg: true,
      description: 'Thick chilled yogurt drink lightly sweetened with cardamom', emoji: '🥛' },
    { id: 'I00027', name: 'Jaljeera',       category: 'beverages', price: 40,  veg: true,
      description: 'Tangy cumin-spiced chilled drink with mint and lemon', emoji: '🍹' },
    { id: 'I00028', name: 'Seviyan Kheer',  category: 'desserts',  price: 190, veg: true,
      description: 'Creamy vermicelli pudding with nuts and cardamom', emoji: '🍮' },
  ],
  R014: [
    { id: 'I00136', name: 'Grilled Sandwich', category: 'mains',     price: 560, veg: true,
      description: 'Triple-layered toasted sandwich with veggies and cheese', emoji: '🥪' },
    { id: 'I00135', name: 'Mosambi Juice',    category: 'mains',     price: 480, veg: true,
      description: 'Freshly squeezed sweet lime juice — chilled and refreshing', emoji: '🍊' },
    { id: 'I00131', name: 'Papad',            category: 'sides',     price: 90,  veg: true,
      description: 'Crispy roasted lentil wafers served with chutneys', emoji: '🥞' },
    { id: 'I00134', name: 'Lotus Stem Chips', category: 'starters',  price: 100, veg: true,
      description: 'Thinly sliced crispy lotus stem seasoned with spices', emoji: '🌿' },
    { id: 'I00132', name: 'Mountain Dew',     category: 'beverages', price: 160, veg: true,
      description: 'Chilled citrus carbonated soft drink', emoji: '🥤' },
    { id: 'I00133', name: 'Lime Soda',        category: 'beverages', price: 50,  veg: true,
      description: 'Fizzy lime soda — sweet or salted, your choice', emoji: '🥤' },
    { id: 'I00137', name: 'Iced Tea',         category: 'beverages', price: 90,  veg: true,
      description: 'Chilled brewed tea with lemon and a hint of mint', emoji: '🍵' },
    { id: 'I00138', name: '7UP',              category: 'beverages', price: 90,  veg: true,
      description: 'Chilled lemon-lime carbonated soft drink', emoji: '🥤' },
    { id: 'I00139', name: 'Oreo McFlurry',    category: 'desserts',  price: 270, veg: true,
      description: 'Creamy vanilla soft serve blended with Oreo cookie pieces', emoji: '🍦' },
    { id: 'I00140', name: 'Brownie',          category: 'desserts',  price: 240, veg: true,
      description: 'Warm fudgy chocolate brownie with a gooey center', emoji: '🍫' },
  ],
  R026: [
    { id: 'I00245', name: 'Idli Sambar',      category: 'mains',     price: 240, veg: true,
      description: 'Steamed rice cakes served with piping hot sambar and chutneys', emoji: '🫓' },
    { id: 'I00246', name: 'Neer Dosa',        category: 'mains',     price: 360, veg: true,
      description: 'Delicate paper-thin rice crepes served with coconut chutney', emoji: '🫓' },
    { id: 'I00247', name: 'Panna Cotta',      category: 'mains',     price: 210, veg: true,
      description: 'Italian cream dessert set with vanilla and topped with berry coulis', emoji: '🍮' },
    { id: 'I00248', name: 'Crème Brûlée',     category: 'mains',     price: 310, veg: true,
      description: 'Classic French custard with a caramelised sugar crust', emoji: '🍮' },
    { id: 'I00244', name: 'Masala Peanuts',   category: 'sides',     price: 80,  veg: true,
      description: 'Crunchy roasted peanuts tossed in spices and fresh herbs', emoji: '🥜' },
    { id: 'I00252', name: 'Onion Rings',      category: 'sides',     price: 160, veg: true,
      description: 'Golden crispy battered onion rings with dipping sauce', emoji: '🧅' },
    { id: 'I00253', name: 'Garlic Naan',      category: 'sides',     price: 140, veg: true,
      description: 'Soft leavened bread with roasted garlic and herb butter', emoji: '🫓' },
    { id: 'I00249', name: 'Mosambi Juice',    category: 'beverages', price: 500, veg: true,
      description: 'Cold-pressed sweet lime juice, served chilled', emoji: '🍊' },
    { id: 'I00250', name: 'Cold Brew Coffee', category: 'beverages', price: 260, veg: true,
      description: 'Smooth slow-steeped cold brew served over ice', emoji: '☕' },
    { id: 'I00251', name: 'Jalebi',           category: 'desserts',  price: 100, veg: true,
      description: 'Warm crispy spirals soaked in saffron sugar syrup', emoji: '🍩' },
  ],
}

// ── Mock recommendations keyed by restaurant ──────────────────────────────────
// Item IDs here must also match the backend dataset.
export const MOCK_RECOMMENDATIONS = {
  R003: {
    withMain: [
      {
        id: 'I00023', name: 'Garlic Naan',    category: 'sides',     price: 90,
        score: 0.963, emoji: '🫓',
        why: 'Classic Biryani companion · High co-occurrence',
      },
      {
        id: 'I00030', name: 'Mixed Pickle',   category: 'sides',     price: 70,
        score: 0.941, emoji: '🥒',
        why: 'Essential Biryani side · Top reorder item',
      },
      {
        id: 'I00026', name: 'Sweet Lassi',    category: 'beverages', price: 100,
        score: 0.897, emoji: '🥛',
        why: 'Beverage slot empty · Perfect Biryani coolant',
      },
      {
        id: 'I00028', name: 'Seviyan Kheer',  category: 'desserts',  price: 190,
        score: 0.874, emoji: '🍮',
        why: 'Dessert slot unfilled · Same cuisine',
      },
      {
        id: 'I00027', name: 'Jaljeera',       category: 'beverages', price: 40,
        score: 0.821, emoji: '🍹',
        why: 'Low-friction add-on · High add-on rate',
      },
    ],
    fallback: [
      {
        id: 'I00022', name: 'Egg Biryani',    category: 'mains',     price: 340,
        score: 0.912, emoji: '🍛',
        why: 'Best-seller at this restaurant · High popularity',
      },
      {
        id: 'I00026', name: 'Sweet Lassi',    category: 'beverages', price: 100,
        score: 0.876, emoji: '🥛',
        why: 'Most ordered beverage · High add-on rate',
      },
      {
        id: 'I00028', name: 'Seviyan Kheer',  category: 'desserts',  price: 190,
        score: 0.844, emoji: '🍮',
        why: 'Top dessert · Frequently ordered with meals',
      },
      {
        id: 'I00023', name: 'Garlic Naan',    category: 'sides',     price: 90,
        score: 0.821, emoji: '🫓',
        why: 'Signature side · Biryani essential',
      },
      {
        id: 'I00029', name: 'Kacchi Biryani', category: 'mains',     price: 250,
        score: 0.789, emoji: '🍛',
        why: 'Popular main · Frequent basket companion',
      },
    ],
  },
  R014: {
    withMain: [
      {
        id: 'I00131', name: 'Papad',           category: 'sides',     price: 90,
        score: 0.945, emoji: '🥞',
        why: 'Classic starter companion · High co-occurrence',
      },
      {
        id: 'I00132', name: 'Mountain Dew',    category: 'beverages', price: 160,
        score: 0.912, emoji: '🥤',
        why: 'Beverage slot empty · Top add-on rate',
      },
      {
        id: 'I00139', name: 'Oreo McFlurry',   category: 'desserts',  price: 270,
        score: 0.867, emoji: '🍦',
        why: 'Dessert upsell · High acceptance rate',
      },
      {
        id: 'I00134', name: 'Lotus Stem Chips', category: 'starters', price: 100,
        score: 0.834, emoji: '🌿',
        why: 'Popular starter · Frequent basket companion',
      },
      {
        id: 'I00137', name: 'Iced Tea',        category: 'beverages', price: 90,
        score: 0.791, emoji: '🍵',
        why: 'Light refresher · Complements mains',
      },
    ],
    fallback: [
      {
        id: 'I00136', name: 'Grilled Sandwich', category: 'mains',   price: 560,
        score: 0.908, emoji: '🥪',
        why: 'Best-selling main · High popularity',
      },
      {
        id: 'I00132', name: 'Mountain Dew',    category: 'beverages', price: 160,
        score: 0.879, emoji: '🥤',
        why: 'Most ordered beverage · Classic fast food combo',
      },
      {
        id: 'I00140', name: 'Brownie',         category: 'desserts',  price: 240,
        score: 0.851, emoji: '🍫',
        why: 'Popular dessert · Frequent upsell',
      },
      {
        id: 'I00134', name: 'Lotus Stem Chips', category: 'starters', price: 100,
        score: 0.812, emoji: '🌿',
        why: 'Crunchy starter · High add-on acceptance',
      },
      {
        id: 'I00133', name: 'Lime Soda',       category: 'beverages', price: 50,
        score: 0.776, emoji: '🥤',
        why: 'Low-friction add-on · Budget-friendly refresher',
      },
    ],
  },
  R026: {
    withMain: [
      {
        id: 'I00250', name: 'Cold Brew Coffee', category: 'beverages', price: 260,
        score: 0.956, emoji: '☕',
        why: 'Beverage slot empty · Perfect pairing',
      },
      {
        id: 'I00244', name: 'Masala Peanuts',   category: 'sides',     price: 80,
        score: 0.921, emoji: '🥜',
        why: 'Low-friction add-on · High co-occurrence',
      },
      {
        id: 'I00251', name: 'Jalebi',           category: 'desserts',  price: 100,
        score: 0.889, emoji: '🍩',
        why: 'Dessert slot unfilled · Same cuisine affinity',
      },
      {
        id: 'I00252', name: 'Onion Rings',      category: 'sides',     price: 160,
        score: 0.856, emoji: '🧅',
        why: 'Savoury contrast · Frequently ordered together',
      },
      {
        id: 'I00249', name: 'Mosambi Juice',    category: 'beverages', price: 500,
        score: 0.812, emoji: '🍊',
        why: 'Fresh juice · High afternoon order rate',
      },
    ],
    fallback: [
      {
        id: 'I00245', name: 'Idli Sambar',      category: 'mains',     price: 240,
        score: 0.934, emoji: '🫓',
        why: 'Signature item · Best-seller at this restaurant',
      },
      {
        id: 'I00250', name: 'Cold Brew Coffee', category: 'beverages', price: 260,
        score: 0.902, emoji: '☕',
        why: 'Top beverage pairing · High add-on rate',
      },
      {
        id: 'I00251', name: 'Jalebi',           category: 'desserts',  price: 100,
        score: 0.871, emoji: '🍩',
        why: 'Most ordered dessert · Classic combo',
      },
      {
        id: 'I00244', name: 'Masala Peanuts',   category: 'sides',     price: 80,
        score: 0.843, emoji: '🥜',
        why: 'Low-friction add-on · Enhances meal',
      },
      {
        id: 'I00247', name: 'Panna Cotta',      category: 'mains',     price: 210,
        score: 0.798, emoji: '🍮',
        why: 'Popular dessert main · Frequent basket companion',
      },
    ],
  },
}

// ── Restaurant overview data ──────────────────────────────────────────────────
export const RESTAURANT_OVERVIEW = {
  R003: {
    about: 'Biryani Blues is a beloved dum biryani specialist serving authentic Hyderabadi-style biryanis since 2012. Every pot is slow-cooked over charcoal using hand-ground spices and premium basmati rice. A go-to destination for biryani lovers across Mumbai.',
    address: '14, Carter Road, Bandra West, Mumbai 400050',
    timings: '11:00 AM - 11:00 PM (Mon-Sun)',
    cuisines: ['North Indian', 'Biryani', 'Mughlai', 'Kebabs'],
    costForTwo: 300,
    paymentModes: ['Cash', 'UPI', 'Credit/Debit Card', 'Zomato Pay'],
    knownFor: ['Dum Biryani', 'Garlic Naan', 'Sweet Lassi', 'Seviyan Kheer'],
    safetyMeasures: ['Rider hand-wash', 'Contactless delivery', 'Tamper-proof packaging'],
    phone: '+91 22 2600 1234',
  },
  R014: {
    about: 'The Urban Bistro is a trendy fast-food cafe in the heart of Bangalore, blending international street food with desi flavours. Known for generous portions, creative sandwiches, and hand-crafted beverages. Perfect for a quick bite or a weekend hangout.',
    address: '42, 100 Feet Road, Indiranagar, Bangalore 560038',
    timings: '10:00 AM - 12:00 AM (Mon-Sun)',
    cuisines: ['Fast Food', 'Street Food', 'Cafe', 'Beverages'],
    costForTwo: 400,
    paymentModes: ['Cash', 'UPI', 'Credit/Debit Card', 'Zomato Pay', 'Paytm'],
    knownFor: ['Grilled Sandwich', 'Lotus Stem Chips', 'Oreo McFlurry', 'Iced Tea'],
    safetyMeasures: ['Rider hand-wash', 'Contactless delivery', 'Daily temperature checks'],
    phone: '+91 80 4100 5678',
  },
  R026: {
    about: 'The Heritage Kitchen celebrates India\'s culinary diversity under one roof. From crispy South Indian dosas to French crème brûlée, every dish is prepared with artisanal care. Located in a restored Pune heritage bungalow, it offers a dining experience that bridges tradition and modernity.',
    address: '7, Koregaon Park Lane, Pune 411001',
    timings: '8:00 AM - 11:30 PM (Mon-Sun)',
    cuisines: ['South Indian', 'Continental', 'Desserts', 'North Indian', 'Beverages'],
    costForTwo: 500,
    paymentModes: ['Cash', 'UPI', 'Credit/Debit Card', 'Zomato Pay'],
    knownFor: ['Idli Sambar', 'Neer Dosa', 'Cold Brew Coffee', 'Jalebi'],
    safetyMeasures: ['Rider hand-wash', 'Contactless delivery', 'Tamper-proof packaging', 'Kitchen CCTV'],
    phone: '+91 20 6700 9012',
  },
}

// ── Restaurant reviews ───────────────────────────────────────────────────────
export const RESTAURANT_REVIEWS = {
  R003: {
    summary: { average: 4.2, total: 1243, five: 612, four: 340, three: 172, two: 78, one: 41 },
    reviews: [
      {
        name: 'Priya S.', rating: 5, date: 'Feb 18, 2026',
        comment: 'Hands down the best biryani in Mumbai! The Egg Biryani was packed with flavour and the portion size was generous. Garlic Naan was perfectly crispy. Will order again!',
        orderedItems: ['Egg Biryani', 'Garlic Naan', 'Sweet Lassi'],
      },
      {
        name: 'Rohit M.', rating: 4, date: 'Feb 10, 2026',
        comment: 'Lamb Biryani was excellent — tender meat and aromatic rice. Delivery took a bit longer than expected but the food quality made up for it. Jaljeera was refreshing.',
        orderedItems: ['Lamb Biryani', 'Jaljeera'],
      },
      {
        name: 'Ananya K.', rating: 4, date: 'Jan 28, 2026',
        comment: 'Great value for money! Kacchi Biryani and Rajma Chawal were both tasty. Seviyan Kheer was the perfect ending. Packaging was neat and delivery was on time.',
        orderedItems: ['Kacchi Biryani', 'Rajma Chawal', 'Seviyan Kheer'],
      },
      {
        name: 'Arjun D.', rating: 3, date: 'Jan 15, 2026',
        comment: 'Food was decent but the Mixed Pickle was too salty for my taste. Biryani itself was good. Cold Coffee was average. Overall an okay experience.',
        orderedItems: ['Egg Biryani', 'Mixed Pickle', 'Cold Coffee'],
      },
    ],
  },
  R014: {
    summary: { average: 4.0, total: 876, five: 380, four: 265, three: 130, two: 65, one: 36 },
    reviews: [
      {
        name: 'Sneha R.', rating: 5, date: 'Feb 20, 2026',
        comment: 'The Grilled Sandwich here is unreal — cheesy, crunchy, and loaded with veggies. Paired it with an Iced Tea and it was the perfect lunch combo. Highly recommend!',
        orderedItems: ['Grilled Sandwich', 'Iced Tea'],
      },
      {
        name: 'Varun P.', rating: 4, date: 'Feb 12, 2026',
        comment: 'Lotus Stem Chips are such a unique snack — crispy and addictive. The Oreo McFlurry was thick and creamy. Great cafe vibes even for delivery.',
        orderedItems: ['Lotus Stem Chips', 'Oreo McFlurry', 'Lime Soda'],
      },
      {
        name: 'Meera T.', rating: 4, date: 'Feb 1, 2026',
        comment: 'Solid fast food joint. The Brownie was warm and gooey — exactly how I like it. Mountain Dew was ice cold. Delivery was super fast, under 25 minutes!',
        orderedItems: ['Brownie', 'Mountain Dew', 'Papad'],
      },
      {
        name: 'Karthik N.', rating: 3, date: 'Jan 20, 2026',
        comment: 'Mosambi Juice felt a bit overpriced for the quantity. 7UP was fine. Papad was a nice touch. Food is good but not exceptional for the price point.',
        orderedItems: ['Mosambi Juice', '7UP', 'Papad'],
      },
    ],
  },
  R026: {
    summary: { average: 4.3, total: 654, five: 310, four: 198, three: 90, two: 38, one: 18 },
    reviews: [
      {
        name: 'Ishita G.', rating: 5, date: 'Feb 22, 2026',
        comment: 'What a gem of a restaurant! The Neer Dosa was paper thin and delicious. Cold Brew Coffee was smooth and not bitter at all. The Jalebi was warm and syrupy — loved every bite.',
        orderedItems: ['Neer Dosa', 'Cold Brew Coffee', 'Jalebi'],
      },
      {
        name: 'Sameer J.', rating: 5, date: 'Feb 14, 2026',
        comment: 'Idli Sambar was authentic South Indian comfort food. The Panna Cotta surprised me — creamy and perfectly set. This place does multi-cuisine right.',
        orderedItems: ['Idli Sambar', 'Panna Cotta', 'Masala Peanuts'],
      },
      {
        name: 'Divya L.', rating: 4, date: 'Feb 5, 2026',
        comment: 'Crème Brûlée was delightful. Onion Rings were crispy. Mosambi Juice was fresh but a bit pricey. Overall a great experience with beautiful packaging.',
        orderedItems: ['Crème Brûlée', 'Onion Rings', 'Mosambi Juice'],
      },
      {
        name: 'Rajesh B.', rating: 3, date: 'Jan 22, 2026',
        comment: 'Garlic Naan was good. Masala Peanuts were a nice starter. Delivery was slightly late but the food was still warm. Decent but I expected a bit more variety.',
        orderedItems: ['Garlic Naan', 'Masala Peanuts'],
      },
    ],
  },
}

// ── Category metadata ─────────────────────────────────────────────────────────
export const CATEGORY_META = {
  mains:     { label: 'Main',     color: 'bg-orange-100 text-orange-700' },
  beverages: { label: 'Beverage', color: 'bg-blue-100 text-blue-700'    },
  sides:     { label: 'Side',     color: 'bg-green-100 text-green-700'  },
  desserts:  { label: 'Dessert',  color: 'bg-purple-100 text-purple-700'},
  starters:  { label: 'Starter',  color: 'bg-yellow-100 text-yellow-700'},
}

// Category weights for meal completeness score
export const COMPLETENESS_WEIGHTS = {
  mains:     0.40,
  beverages: 0.25,
  sides:     0.20,
  desserts:  0.10,
  starters:  0.05,
}

// Static model metrics for StatsPanel
export const MODEL_METRICS = [
  { label: 'AUC-ROC',             value: '0.705',        note: 'vs 0.600 baseline',      highlight: false },
  { label: 'NDCG@5',              value: '0.738',        note: '+82% vs baseline',        highlight: false },
  { label: 'MRR',                 value: '0.651',        note: '+92% vs baseline',        highlight: false },
  { label: 'p99 Latency',         value: '7.01ms',       note: '200ms SLA',               highlight: false, check: true },
  { label: 'SLA Headroom',        value: '28x under 200ms', note: null,                   highlight: true  },
  { label: 'Annual Rev Lift',     value: 'Rs.1,586 Cr',  note: '+5.7% AOV lift',          highlight: false },
]
