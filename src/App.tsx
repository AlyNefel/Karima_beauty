import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  X, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  Info,
  Lock,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import Header from './components/Header.tsx';
import ProductCard from './components/ProductCard.tsx';
import ProductDetailsModal from './components/ProductDetailsModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import CheckoutForm from './components/CheckoutForm.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import SupportChatWidget from './components/SupportChatWidget.tsx';
import { Product, Category, CartItem, Order, ChatSession, Customer, CardDetails } from './types.ts';

export default function App() {
  // Application datasets
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [chats, setChats] = React.useState<ChatSession[]>([]);

  // User States
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string; isAdmin: boolean; phone?: string; address?: string; city?: string } | null>(null);
  
  // Shopping cart states
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkingOut, setCheckingOut] = React.useState(false);

  // Active view constraints
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string | null>(null);
  
  // Filter search queries
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<number>(85); // Up to 85 DT
  const [stockOnly, setStockOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'trending' | 'priceAsc' | 'priceDesc' | 'rating'>('trending');
  
  // UI control states
  const [selectedProductDetails, setSelectedProductDetails] = React.useState<Product | null>(null);
  const [isAdminView, setIsAdminView] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);

  // Auth form states
  const [authForm, setAuthForm] = React.useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    city: 'Tunis'
  });
  const [authError, setAuthError] = React.useState('');

  // Checkout Results
  const [lastPlacedOrder, setLastPlacedOrder] = React.useState<Order | null>(null);
  const [simulatedEmailHTML, setSimulatedEmailHTML] = React.useState<string | null>(null);
  const [isPlacing, setIsPlacing] = React.useState(false);

  // Fetch initial system datasets on boot
  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchChats();
  }, []);

  // Sync orders if logged as admin
  React.useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Avoid exceeding stock
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true); // Open drawer automatically
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setCheckingOut(true);
    setLastPlacedOrder(null);
    setSimulatedEmailHTML(null);
  };

  // Authentication flows
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering 
      ? authForm 
      : { email: authForm.email, password: authForm.password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Une erreur s\'est produite.');
        return;
      }

      // Login success
      setCurrentUser(data);
      setAuthModalOpen(false);
      
      // Clear values
      setAuthForm({
        email: '',
        password: '',
        name: '',
        phone: '',
        address: '',
        city: 'Tunis'
      });
    } catch (err) {
      setAuthError('Connexion interrompue avec le serveur.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminView(false);
  };

  // Place order
  const handleCheckoutComplete = async (checkoutData: {
    customer: Customer;
    paymentMethod: 'card' | 'cod';
    cardDetails?: CardDetails;
  }) => {
    setIsPlacing(true);
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category
    }));

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const payload = {
      items: orderItems,
      total,
      customer: checkoutData.customer,
      paymentMethod: checkoutData.paymentMethod,
      cardDetails: checkoutData.cardDetails
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setLastPlacedOrder(data.order);
        setSimulatedEmailHTML(data.simulatedEmailHTML);
        setCart([]); // Clear cart
        setCheckingOut(false);
        fetchProducts(); // Refresh stocks on client
        if (currentUser?.isAdmin) fetchOrders();
      }
    } catch (err) {
      console.error('Error submitting order checkout:', err);
    } finally {
      setIsPlacing(false);
    }
  };

  // Support chat connector
  const handleSendSupportMessage = async (sessionId: string, text: string): Promise<ChatSession> => {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, text })
    });
    const updatedSession = await res.json();
    
    // Refresh admin view list
    fetchChats();
    return updatedSession;
  };

  // Admin panel callbacks
  const handleUpdateProduct = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Admin update error:', err);
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Admin creation error:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer définitivement ce soin esthétique de la carte ?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Admin deletion error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status, paymentStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Order status update error:', err);
    }
  };

  const handleSendAdminReply = async (sessionId: string, text: string) => {
    try {
      const res = await fetch('/api/admin/chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, text })
      });
      if (res.ok) {
        fetchChats();
      }
    } catch (err) {
      console.error('Admin support reply dispatch error:', err);
    }
  };

  // FILTER LOGIC
  const filteredProducts = products.filter(p => {
    // 1. Category filter
    if (activeCategory && p.category !== activeCategory) return false;
    
    // 2. Subcategory filter
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;

    // 3. Search text query
    if (searchQuery) {
      const matchText = `${p.name} ${p.description} ${p.subcategory}`.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }

    // 4. Price filter
    if (p.price > priceRange) return false;

    // 5. Stock filter
    if (stockOnly && p.stock === 0) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.trending ? 1 : 0) - (a.trending ? 1 : 0); // Default to trending/best tags
  });

  // Get active subcategories list based on selected category Vif, Farmasi or Arvea
  const activeSubcategories = categories.find(c => c.id === activeCategory)?.subcategories || [];

  return (
    <div className="min-h-screen bg-[#faf6f0] text-gray-800 flex flex-col font-sans transition-all selection:bg-[#d4af37]/30">
      
      {/* Dynamic Header */}
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setSelectedSubcategory(null); // Reset subcategory when category changes
          setCheckingOut(false);
          setLastPlacedOrder(null);
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => { setAuthModalOpen(true); setIsRegistering(false); }}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        onToggleAdminView={() => {
          setIsAdminView(!isAdminView);
          setActiveCategory(null);
          setSelectedSubcategory(null);
          setCheckingOut(false);
        }}
        onOpenSupport={() => setSupportOpen(true)}
      />

      {/* Hero Banner Area (Show on Home Catalog without checkout) */}
      {!checkingOut && !lastPlacedOrder && !isAdminView && (
        <section className="mb-12">
          <div className="h-[28rem] sm:h-96 bg-[#EBEAE6] relative overflow-hidden flex items-center px-6 sm:px-12">
            <div className="max-w-md relative z-10 text-left">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase flex items-center gap-1.5 mb-2.5">
                <Sparkles className="text-[#D4AF37] animate-pulse" size={13} /> EXCLUSIVE & PREMIUM
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-[#1A1A1A] font-serif mb-4 leading-tight tracking-wide">
                La pureté de votre éclat d'origine
              </h2>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-6">
                La synergie de la dermo-science <strong className="text-[#1A1A1A]">Vif</strong>, la splendeur maquillage <strong className="text-[#1A1A1A]">Farmasi</strong>, et l'aloé vera originel <strong className="text-[#1A1A1A]">Arvea Nature</strong>.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2 text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A]">
                <span className="bg-white/80 border border-[#E5E5E1] px-3 py-1.5">🔬 Science Vif</span>
                <span className="bg-white/80 border border-[#E5E5E1] px-3 py-1.5">💄 Glamour Farmasi</span>
                <span className="bg-white/80 border border-[#E5E5E1] px-3 py-1.5">🌿 Natural Arvea</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-35 sm:opacity-40 pointer-events-none bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=1200&auto=format&fit=crop')]" />
          </div>
        </section>
      )}

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* 1. ADMIN DASHBOARD ROUTE */}
          {isAdminView && currentUser?.isAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard
                products={products}
                orders={orders}
                chats={chats}
                categories={categories}
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSendAdminReply={handleSendAdminReply}
                onClose={() => setIsAdminView(false)}
              />
            </motion.div>
          )

          // 2. CHECKOUT SUCCESS SCREEN
          : lastPlacedOrder ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6"
            >
              <div className="inline-flex p-4 bg-green-50 text-green-700 rounded-full border border-green-100 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 font-serif">Commande Enregistrée !</h2>
                <p className="text-sm text-gray-600">Votre commande <strong className="text-gray-900">#{lastPlacedOrder.id}</strong> a été validée avec succès.</p>
                <p className="text-xs text-gray-500">Un récapitulatif détaillé vous attend dans votre boîte mail.</p>
              </div>

              {/* simulated email logs previewer */}
              {simulatedEmailHTML && (
                <div className="bg-white rounded-xl border border-[#e9dfd3] p-6 text-left shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="text-[#d4af37]" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-700">✉️ Email Envoyé (Simulation SMTP)</h4>
                        <p className="text-[9px] text-gray-400">SMTP: gmail.karimabeauty.com | Destinataire: {lastPlacedOrder.customer.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#faf6f0] text-[#d4af37] font-bold px-2.5 py-0.5 rounded border border-[#e9dfd3]">
                      Developer Live Preview
                    </span>
                  </div>

                  {/* Rendered HTML inside interactive Sandbox */}
                  <div className="border rounded bg-amber-50/5 overflow-x-auto max-h-[350px] p-2 zoom-75">
                    <div dangerouslySetInnerHTML={{ __html: simulatedEmailHTML }} />
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setLastPlacedOrder(null);
                  setSimulatedEmailHTML(null);
                  setCheckingOut(false);
                  setActiveCategory(null);
                }}
                className="mt-6 inline-flex bg-[#2c2520] hover:bg-[#d4af37] text-white text-xs font-semibold tracking-widest uppercase px-8 py-3.5 rounded-lg transition-all shadow-md cursor-pointer"
              >
                Continuer Mes Achats
              </button>
            </motion.div>
          )

          // 3. CHECKOUT VIEW PANEL
          : checkingOut ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckoutForm
                cartItems={cart}
                currentUser={currentUser}
                onCheckoutComplete={handleCheckoutComplete}
                onCancel={() => setCheckingOut(false)}
                isPlacing={isPlacing}
              />
            </motion.div>
          )

          // 4. MAIN STORE CATALOG GRID WITH REAL-TIME FILTERS
          : (
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              
              {/* Product Search & Sidebar Filtering Engine */}
              <aside className="lg:col-span-1 space-y-6 text-left">
                
                {/* Search string */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un soin..."
                    className="w-full bg-[#F2F1ED] pl-4 pr-10 py-3 text-xs border border-transparent rounded-none focus:outline-none focus:border-[#D4AF37] text-[#1A1A1A]"
                  />
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
                </div>

                {/* Categories description label if selected */}
                {activeCategory && (
                  <div className="bg-white text-[#1A1A1A] p-4 border border-[#E5E5E1] space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase text-[#D4AF37]">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </h4>
                    <p className="text-[10px] leading-relaxed text-[#6B6B6B]">
                      {categories.find(c => c.id === activeCategory)?.description}
                    </p>
                  </div>
                )}

                {/* Filter Sidebar Card Container */}
                <div className="bg-white p-5 border border-[#E5E5E1] space-y-5">
                  <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-2">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] flex items-center gap-1.5">
                      <SlidersHorizontal size={13} /> RECHERCHE & FILTRES
                    </h3>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSubcategory(null);
                        setPriceRange(85);
                        setStockOnly(false);
                      }}
                      className="text-[10px] text-[#D4AF37] font-semibold hover:underline cursor-pointer"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  {/* Subcategories (Context Aware: displays only if brand category is clicked!) */}
                  {activeCategory ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                        Sous-Catégories
                      </label>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => setSelectedSubcategory(null)}
                          className={`text-left text-xs px-2.5 py-2 transition-colors cursor-pointer ${
                            !selectedSubcategory 
                              ? 'bg-[#FAF9F6] text-[#1A1A1A] font-semibold border-l border-[#1A1A1A]' 
                              : 'text-[#6B6B6B] hover:bg-gray-50'
                          }`}
                        >
                          Toutes les sous-catégories
                        </button>
                        {activeSubcategories.map((sub, key) => (
                          <button
                            key={key}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`text-left text-xs px-2.5 py-2 transition-colors cursor-pointer ${
                              selectedSubcategory === sub 
                                ? 'bg-[#FAF9F6] text-[#1A1A1A] font-semibold border-l border-[#1A1A1A]' 
                                : 'text-[#6B6B6B] hover:bg-gray-50'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FAF9F6] p-3 border border-[#E5E5E1] text-[10px] text-[#6B6B6B] font-medium leading-relaxed">
                      💡 Cliquez sur une marque (Vif, Farmasi, Arvea) dans le menu supérieur pour afficher les sous-catégories spécifiques.
                    </div>
                  )}

                  {/* Price Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                      <span>Budget Maximum</span>
                      <span className="text-[#D4AF37] font-bold tracking-normal">{priceRange} DT</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-0.5 bg-gray-200 rounded-none appearance-none cursor-pointer accent-[#1A1A1A]"
                    />
                    <div className="flex justify-between text-[8px] text-[#9E9E9E] font-mono">
                      <span>10 DT</span>
                      <span>100 DT</span>
                    </div>
                  </div>

                  {/* Stock status toggle */}
                  <div className="pt-2 border-t border-[#F2F1ED]">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockOnly}
                        onChange={(e) => setStockOnly(e.target.checked)}
                        className="rounded-none border-[#E5E5E1] text-[#1A1A1A] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">
                        Uniquement en Stock
                      </span>
                    </label>
                  </div>

                  {/* Sorting methods */}
                  <div className="pt-4 border-t border-[#F2F1ED] space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                      Trier Par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="w-full text-xs border border-[#E5E5E1] bg-white rounded-none px-2.5 py-2 focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                    >
                      <option value="trending">Tendance & Populaires</option>
                      <option value="priceAsc">Prix: Croissant</option>
                      <option value="priceDesc">Prix: Décroissant</option>
                      <option value="rating">Évaluation Client</option>
                    </select>
                  </div>

                </div>
              </aside>

              {/* Product Grid Area - 3 cols */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Info row */}
                <div className="flex justify-between items-center bg-white p-4 border border-[#E5E5E1]">
                  <p className="text-xs text-[#6B6B6B] font-sans">
                    Affichage de <span className="font-semibold text-[#1A1A1A]">{filteredProducts.length}</span> soins esthétiques d'exception
                  </p>
                </div>

                {/* Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white border border-[#E5E5E1] py-20 text-center space-y-3">
                    <ShoppingBag className="mx-auto text-[#9E9E9E]" size={32} />
                    <p className="text-sm font-semibold text-[#1A1A1A]">Aucun soin trouvé</p>
                    <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">Essayez d'ajuster vos critères ou réinitialisez le budget maximum.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(p) => setSelectedProductDetails(p)}
                      />
                    ))}
                  </div>
                )}

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2c2520] text-gray-300 py-12 mt-auto border-t-2 border-[#d4af37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <h3 className="text-base font-light tracking-widest text-[#d4af37] font-serif uppercase">
              KARIMA<span className="font-bold text-white"> BEAUTY BOUTIQUE</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              La boutique d'esthétique et cosmétiques de luxe regroupant les meilleures signatures : **Vif** dermo-soins, **Farmasi** makeup d'exception, et la nutrition pure de l'aloé vera **Arvea France/Tunisie**.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Modes de Paiement</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <p>💳 Paiement par carte bancaire sécurisé</p>
              <p>💵 Paiement en espèces à la livraison (COD)</p>
              <p>⚡ Livraison EXPRESS offerte vers tous les gouvernorats</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Contact Support hotlines</h4>
            <div className="space-y-1 text-xs text-gray-400 font-mono">
              <p>📍 Les Berges du Lac 2, Tunis, Tunisie</p>
              <p>📞 Tél: +216 22 111 222</p>
              <p>✉️ support@karimabeauty.com</p>
            </div>
          </div>
        </div>
      </footer>

      {/* --- DRAWERS AND MODALS MODULATORS --- */}

      {/* 1. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 2. Product Details Modal */}
      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 3. Floating Support Chat Widget with Gemini AI */}
      <SupportChatWidget
        onSendMessage={handleSendSupportMessage}
        chats={chats}
      />

      {/* 4. Login Register Account Dialog panel */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* backdrop escape trigger */}
          <div className="absolute inset-0" onClick={() => setAuthModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-left animate-scaleUp border border-[#e9dfd3]">
            {/* Close button */}
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#2c2520] uppercase font-serif tracking-wide mb-1">
              {isRegistering ? 'Créer un compte' : 'Me connecter'}
            </h3>
            <p className="text-[11px] text-[#8a7a6e] mb-4">
              {isRegistering ? 'Rejoignez le club privilège Karima Beauty.' : 'Retrouvez vos soins préférés et vos commandes.'}
            </p>

            {authError && (
              <div className="p-2.5 bg-red-50 text-red-800 text-xs font-semibold rounded border border-red-150 mb-4">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              
              {isRegistering && (
                <div>
                  <label className="block text-gray-600 font-bold mb-1 uppercase">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="Jean Dupont"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-600 font-bold mb-1 uppercase">Adresse Email *</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 uppercase">Mot De Passe *</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                  placeholder="••••••••"
                />
              </div>

              {isRegistering && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1 uppercase">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={authForm.phone}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                      placeholder="+216 22 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a4e44] font-bold uppercase mb-1">Gouvernorat *</label>
                    <select
                      value={authForm.city}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37] bg-white text-xs text-[#2c2520]"
                    >
                      <option value="Tunis">Tunis</option>
                      <option value="Ariana">Ariana</option>
                      <option value="Ben Arous">Ben Arous</option>
                      <option value="Manouba">Manouba</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Nabeul">Nabeul</option>
                    </select>
                  </div>
                </div>
              )}

              {isRegistering && (
                <div>
                  <label className="block text-[#5a4e44] font-bold uppercase mb-1">Adresse de livraison *</label>
                  <input
                    type="text"
                    required
                    value={authForm.address}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="Ex: 12 Rue des jasmins, Tunis"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2c2520] hover:bg-[#d4af37] text-white font-bold tracking-widest uppercase rounded-lg transition-colors cursor-pointer"
              >
                {isRegistering ? "Créer Mon Compte Privilège" : "Me Connecter"}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
                className="text-xs text-[#d4af37] font-semibold hover:underline cursor-pointer"
              >
                {isRegistering ? "Déjà membre? Se connecter" : "Nouveau client? Créer un compte"}
              </button>
            </div>

            {/* Developer credentials reference */}
            <div className="mt-4 p-2 bg-[#faf6f0] border rounded text-[9.5px] text-[#8a7a6e]">
              🔑 Dev-Hint: Admin login is <strong className="text-[#2c2520]">admin@karimabeauty.com</strong> with password <strong className="text-[#2c2520]">admin123</strong>.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
