import { Product, Category } from './types.ts';

export const CATEGORIES: Category[] = [
  {
    id: 'vif',
    name: 'Vif',
    description: 'Dermo-cosmetic solutions and high-performance sun protection powered by scientific research.',
    subcategories: ['Sun Protection', 'Dermo-Purifying Cleansers', 'Anti-Aging Serums', 'Daily Moisturizers']
  },
  {
    id: 'farmasi',
    name: 'Farmasi',
    description: 'Premium European makeup, vibrant cosmetics, and natural therapeutics for hair and skin care.',
    subcategories: ['VFX Face Makeup', 'Eyes & Mascaras', 'Matte Lipsticks', 'Hair Care Therapy', 'Calendula Healing']
  },
  {
    id: 'arvea',
    name: 'Arvea Nature',
    description: 'Natural healing formulations blending pure Aloe Vera and organic Argan Oil for optimal radiance.',
    subcategories: ['Aloe & Argan Body Milk', 'Miracle Multi-Use Creams', 'Soothing Aloe Vera Gels', 'Body Slimming & Toning']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- VIF ---
  {
    id: 'vif-sunscreen-50',
    name: 'Vif Crème Solaire Invisible SPF 50+',
    description: 'Very high protection sunscreen with a dry touch, matte finish. Non-greasy, anti-sand, and water-resistant. Ideal for everyday face protection. Hypoallergenic and fragrance-free.',
    price: 49.90,
    oldPrice: 58.00,
    category: 'vif',
    subcategory: 'Sun Protection',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    stock: 25,
    trending: true,
    bestSeller: true,
    ingredients: ['Titanium Dioxide', 'Zinc Oxide', 'Tocopherol (Vitamin E)', 'Thermal Spring Water', 'Glycerin'],
    howToUse: 'Apply generously to face and neck 20 minutes before sun exposure. Reapply every 2 hours, especially after swimming or drying.'
  },
  {
    id: 'vif-cleansing-gel',
    name: 'Vif Dermo-Purifying Cleansing Gel',
    description: 'Deeply cleanses pores, regulates excess oil secretion, and eliminates acne-causing bacteria without stripping moisture. Enriched with zinc PCA and organic tea tree extracts.',
    price: 34.50,
    category: 'vif',
    subcategory: 'Dermo-Purifying Cleansers',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    stock: 45,
    trending: false,
    bestSeller: true,
    ingredients: ['Salicylic Acid 2%', 'Zinc PCA', 'Tea Tree Oil Extract', 'Aloe Barbadensis Leaf Juice', 'Allantoin'],
    howToUse: 'Apply a dime-sized amount to wet skin, massage gently in circular motions for 1 minute, and rinse thoroughly with lukewarm water.'
  },
  {
    id: 'vif-retinol-booster',
    name: 'Vif Retinol Booster Serum 1.5%',
    description: 'Advanced nighttime renewal serum. Accelerates cellular turnover, visibly reduces fine lines, refines skin texture, and minimizes the appearance of dark spots and hyperpigmentation.',
    price: 72.00,
    oldPrice: 85.00,
    category: 'vif',
    subcategory: 'Anti-Aging Serums',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    stock: 12,
    trending: true,
    bestSeller: false,
    ingredients: ['Encapsulated Retinol 1.5%', 'Hyaluronic Acid', 'Niacinamide (Vitamin B3)', 'Ceramides', 'Centella Asiatica (Cica)'],
    howToUse: 'Apply 3-4 drops to clean, dry face in the evening. Start 2 times per week and gradually increase frequency as your skin tolerates. Always apply sunscreen the following morning.'
  },
  {
    id: 'vif-hydrasmose',
    name: 'Vif Hydrasmose Gel-Cream 72H',
    description: 'Ultra-light refreshing gel-cream that locks in rich hydration for hours. Infused with cross-linked hyaluronic acid and deep-sea minerals to plump and energize dehydrated skin.',
    price: 42.00,
    category: 'vif',
    subcategory: 'Daily Moisturizers',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    stock: 30,
    trending: false,
    bestSeller: false,
    ingredients: ['Hyaluronic Acid Duplex', 'Sea Mineral Ferments', 'Squalane', 'Pro-Vitamin B5', 'Green Tea Extract'],
    howToUse: 'Apply morning and night onto clean dry skin. Smooth over face and neck until fully absorbed. Perfect as a base under makeup.'
  },

  // --- FARMASI ---
  {
    id: 'farmasi-vfx-primer',
    name: 'Farmasi VFX Pro Camera Ready Primer',
    description: 'The ultimate photo-finish oil-free face primer. Creates a smooth, velvet filter effect, blurs enlarged pores and fine lines, and ensures your makeup lasts flawlessly for up to 16 hours.',
    price: 39.00,
    oldPrice: 48.00,
    category: 'farmasi',
    subcategory: 'VFX Face Makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    stock: 50,
    trending: true,
    bestSeller: true,
    ingredients: ['Dimethicone Crosspolymer', 'Silica', 'Tocopheryl Acetate', 'Phytosterols', 'Mineral Infusions'],
    howToUse: 'Dab a small pea-sized amount onto nose, cheeks, and forehead. Blend outwards using your fingers or a blending sponge before applying foundation.'
  },
  {
    id: 'farmasi-lash-extend',
    name: 'Farmasi Double Lash Extend Mascara',
    description: 'Two-step adjustable mascara that defines both extreme length and dramatic, thick volume in seconds. Features a clever spinning wand cap to filter exact formula loads.',
    price: 29.50,
    category: 'farmasi',
    subcategory: 'Eyes & Mascaras',
    image: 'https://images.unsplash.com/photo-1631730359577-3847f6473d4e?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    stock: 40,
    trending: true,
    bestSeller: true,
    ingredients: ['Carnauba Wax', 'Beeswax', 'Panthenol (Pro-vitamin B5)', 'Iron Oxides', 'Castor Seed Oil'],
    howToUse: 'Use Step 1 (silver cap) to sweep mascara from base to tip for extreme separation and length elongation. Follow with Step 2 (black cap) for deep volumizing coat.'
  },
  {
    id: 'farmasi-matte-rose',
    name: 'Farmasi Matte Liquid Lipstick - Retro Rose',
    description: 'High-pigment, lightweight liquid matte lipstick. Provides absolute smudge-proof and transfer-proof color with a comfortable non-drying finish. Plumps lips with vitamin E hydration.',
    price: 19.90,
    oldPrice: 24.00,
    category: 'farmasi',
    subcategory: 'Matte Lipsticks',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    stock: 60,
    trending: false,
    bestSeller: true,
    ingredients: ['Isododecane', 'Vitamin E (Tocopherol)', 'Shea Butter Extract', 'Mineral Color Primers', 'Kaolin Clay'],
    howToUse: 'Outline lips with the precise precision wand applicator tip, then fill in your lips with a thin single layer. Allow 1 minute to dry to an absolute velvet matte finish.'
  },
  {
    id: 'farmasi-garlic-shampoo',
    name: 'Farmasi Garlic & Capixyl Revitalizing Therapy Shampoo',
    description: 'Best-selling clarifying hair therapy designed for thin, falling, and weak hair. Infused with real garlic extracts (odorless!) and advanced Capixyl peptides to stimulate rapid growth.',
    price: 36.00,
    category: 'farmasi',
    subcategory: 'Hair Care Therapy',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    stock: 18,
    trending: true,
    bestSeller: true,
    ingredients: ['Odorless Garlic Bulb Extract', 'Capixyl Peptide Complex', 'Hydrolyzed Soy Protein', 'Rosemary Leaf Extract', 'Biotin'],
    howToUse: 'Massage shampoo into thoroughly wet hair and deep scalp. Lather well, let it rest for 2-3 minutes to allow Capixyl peptides to absorb, then rinse cleanly. Use three times weekly.'
  },
  {
    id: 'farmasi-calendula-cream',
    name: 'Farmasi Dr. C. Tuna Calendula Face Cream',
    description: 'Soothing lipid-replenishing face cream. Designed specifically for highly sensitive, compromised, eczema-prone, or severely dry skin. Replaces skin oils and repairs moisture barriers.',
    price: 28.00,
    category: 'farmasi',
    subcategory: 'Calendula Healing',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    stock: 22,
    trending: false,
    bestSeller: false,
    ingredients: ['Calendula Officinalis Oil', 'Avocado Oil', 'Shea Butter', 'Soy Glycine Sterols', 'Chamomile Tea Extract'],
    howToUse: 'Dab onto dry facial patches as needed. Smooth gently. Wonderful for dry winter seasons, soothing sunburns, or post-exfoliation repair.'
  },

  // --- ARVEA ---
  {
    id: 'arvea-body-milk',
    name: 'Arvea Lait Corps Hydratant Aloe Vera & Argan',
    description: 'Luxurious moisturizing body lotion harnessing the dual powers of 100% organic Aloe Vera and high-grade Argan Oil. Instantly melts into skin, leaving it deeply nourished, silky, and glowing.',
    price: 24.90,
    oldPrice: 30.00,
    category: 'arvea',
    subcategory: 'Aloe & Argan Body Milk',
    image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    stock: 35,
    trending: true,
    bestSeller: true,
    ingredients: ['Organic Aloe Vera Juice', 'Cold-Pressed Argan Oil', 'Sweet Almond Oil', 'Glycerin', 'Pro-Vitamin B5 (Panthenol)'],
    howToUse: 'Apply generously over the entire body after a bath or shower. Give special attention to rough zones like elbows, knees, and heels.'
  },
  {
    id: 'arvea-miracle-cream',
    name: 'Arvea Crème Miracle Multi-Usage',
    description: 'Arvea\'s legendary calming "Miracle Cream". Infused with honey, propolis, aloe vera gel, and tea tree extracts to heal skin irritation, calm minor scratches, insect bites, or eczema patches.',
    price: 19.50,
    category: 'arvea',
    subcategory: 'Miracle Multi-Use Creams',
    image: 'https://images.unsplash.com/photo-1590156546746-c58d04297a15?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    stock: 15,
    trending: true,
    bestSeller: true,
    ingredients: ['Propolis Extract', 'Wild Honey Blend', 'Pure Aloe Vera Concentrate', 'Tea Tree Melaleuca Oil', 'Shea Butter'],
    howToUse: 'Apply a local layer over skin area requiring healing or calming. Softly massage or leave to dry as an overnight protective mask.'
  },
  {
    id: 'arvea-aloe-gel',
    name: 'Arvea Gel Apaisant Aloe Vera 95%',
    description: 'Pure, concentrated cooling gel made of 95% fresh Aloe Vera leaf pulp. Perfect for deep facial hydration, soothing sunburns, calming reactive skin, and restoring natural water balance.',
    price: 16.00,
    oldPrice: 19.00,
    category: 'arvea',
    subcategory: 'Soothing Aloe Vera Gels',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    stock: 40,
    trending: false,
    bestSeller: true,
    ingredients: ['Aloe Barbadensis Leaf Extract 95%', 'Allantoin', 'Carbomer', 'Aqua', 'Glycereth-26'],
    howToUse: 'Apply a generous thick layer on sunburns, sensitive skin patches, or dry skin after shaving. Let it absorb naturally. Store in the fridge for an icy soothing kick!'
  },
  {
    id: 'arvea-slimming-cream',
    name: 'Arvea Crème Minceur & Anti-Cellulite',
    description: 'Highly effective thermogenic body sculpting cream. Combines active plant caffeine, ivy, and rosemary essences to visibly combat stubborn cellulite, flatten skin, and firm contours.',
    price: 32.00,
    category: 'arvea',
    subcategory: 'Body Slimming & Toning',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    rating: 4.4,
    stock: 20,
    trending: true,
    bestSeller: false,
    ingredients: ['Coffee Bean Caffeine Extract', 'Ivy (Hedera Helix) Oil', 'Rosemary Extract', 'Capsicum Oleoresin', 'Menthol'],
    howToUse: 'Apply to target areas (thighs, hips, belly) massage deeply in circular motion until a warm skin glow and mild tingle starts. Best used before exercise or after a hot bath.'
  }
];
