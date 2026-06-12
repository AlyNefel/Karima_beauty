import React from 'react';
import { Package, Truck, MessageSquare, TrendingUp, DollarSign, PlusCircle, Pencil, Trash2, CheckCircle, ShieldAlert, X, Eye } from 'lucide-react';
import { Product, Order, ChatSession, Category } from '../types.ts';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  chats: ChatSession[];
  categories: Category[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string, paymentStatus: string) => void;
  onSendAdminReply: (sessionId: string, text: string) => void;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  chats,
  categories,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSendAdminReply,
  onClose
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'inventory' | 'orders' | 'support'>('overview');
  
  // Inventory form helpers
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  
  // Cloudinary image upload states and handlers
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image est trop volumineuse (limite: 5 Mo).");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64data })
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Une erreur s'est produite lors du téléversement.");
          }

          setProductForm(prev => ({ ...prev, image: data.url }));
        } catch (err: any) {
          console.error(err);
          setUploadError(err.message || "Une erreur s'est produite lors de l'envoi de l'image.");
        } finally {
          setUploading(false);
        }
      };
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Impossible de lire le fichier de l'image.");
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  
  const [productForm, setProductForm] = React.useState<Partial<Product>>({
    name: '',
    description: '',
    price: 19.90,
    category: 'vif',
    subcategory: '',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop',
    stock: 20,
    trending: false,
    bestSeller: false,
    ingredients: [],
    howToUse: ''
  });

  // Support chat helper
  const [selectedChatSessionId, setSelectedChatSessionId] = React.useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = React.useState('');

  // Calculations for overview tabs
  const totalSales = orders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingSales = orders
    .filter(o => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.total, 0);
  
  const categorySales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const cat = item.category || 'diverse';
      acc[cat] = (acc[cat] || 0) + (item.price * item.quantity);
    });
    return acc;
  }, {} as Record<string, number>);

  const lowStockProducts = products.filter(p => p.stock <= 5);

  const activeChat = chats.find(c => c.sessionId === selectedChatSessionId);

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setProductForm(prev => ({ 
        ...prev, 
        [name]: name === 'price' || name === 'stock' ? Number(value) : value 
      }));
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 15.00,
      category: 'vif',
      subcategory: 'Daily Moisturizers',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop',
      stock: 30,
      trending: false,
      bestSeller: false,
      ingredients: [],
      howToUse: ''
    });
    setIsAdding(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      onAddProduct(productForm as Product);
      setIsAdding(false);
    } else if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productForm } as Product);
      setEditingProduct(null);
    }
  };

  const handleAdminChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedChatSessionId) return;
    onSendAdminReply(selectedChatSessionId, adminReplyText);
    setAdminReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] overflow-y-auto flex flex-col text-left animate-fadeIn">
      {/* Title bar */}
      <div className="bg-[#1A1A1A] text-white p-5 flex items-center justify-between sticky top-0 z-20 border-b border-[#E5E5E1]">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="text-[#D4AF37]" size={18} />
          <div>
            <h1 className="text-sm font-medium tracking-[0.2em] uppercase font-serif">Karima Beauty Admin Hub</h1>
            <p className="text-[10px] text-gray-400 tracking-wider font-mono">Console d'administration • Vif, Farmasi, Arvea</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 border border-white/20 transition-all cursor-pointer"
          title="Fermer la console Admin"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1A1A1A] text-[#D4AF37]'
                : 'bg-white hover:bg-[#FAF9F6] text-gray-700 border border-[#E5E5E1]'
            }`}
          >
            <TrendingUp size={14} />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#1A1A1A] text-[#D4AF37]'
                : 'bg-white hover:bg-[#FAF9F6] text-gray-700 border border-[#E5E5E1]'
            }`}
          >
            <Package size={14} />
            <span>Gestion du Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'bg-[#1A1A1A] text-[#D4AF37]'
                : 'bg-white hover:bg-[#FAF9F6] text-gray-700 border border-[#E5E5E1]'
            }`}
          >
            <Truck size={14} />
            <span>Commandes Client ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${
              activeTab === 'support'
                ? 'bg-[#1A1A1A] text-[#D4AF37]'
                : 'bg-white hover:bg-[#FAF9F6] text-gray-700 border border-[#E5E5E1]'
            }`}
          >
            <MessageSquare size={14} className={chats.some(c => c.isActive) ? 'animate-bounce text-[#D4AF37]' : ''} />
            <span>Support Chat Hub</span>
          </button>
        </aside>

        {/* Console view body */}
        <main className="flex-1 bg-white p-6 border border-[#E5E5E1] shadow-none rounded-none">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#F2F1ED] pb-2">Performance Commerciale</h2>
              
              {/* Stat card group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Ventes Validées</span>
                    <DollarSign size={14} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-xl font-serif font-semibold text-[#1A1A1A]">{totalSales.toFixed(2)} DT</p>
                  <p className="text-[10px] text-green-800 mt-1 uppercase tracking-wider font-semibold">Revenus validés livrés</p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">En cours de livraison</span>
                    <Truck size={14} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-xl font-serif font-semibold text-[#1A1A1A]">{pendingSales.toFixed(2)} DT</p>
                  <p className="text-[10px] text-[#6B6B6B] mt-1 uppercase tracking-wider font-semibold">Facturation COD en cours</p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Commandes Totales</span>
                    <Package size={14} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-xl font-serif font-semibold text-[#1A1A1A]">{orders.length}</p>
                  <p className="text-[10px] text-[#D4AF37] mt-1 uppercase tracking-wider font-semibold">{orders.filter(o => o.orderStatus === 'new').length} NOUVELLES FICHES</p>
                </div>
              </div>

              {/* Category charts & low stocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Brand breakdown */}
                <div className="bg-[#faf6f0]/50 p-5 rounded-xl border border-gray-150">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-gray-700 mb-3">Ventes Par Marque</h4>
                  <div className="space-y-3">
                    {categories.map(cat => {
                      const sales = categorySales[cat.id] || 0;
                      const percentage = totalSales + pendingSales > 0 ? (sales / (totalSales + pendingSales)) * 100 : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-gray-700">
                            <span>{cat.name}</span>
                            <span>{sales.toFixed(2)} DT ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${cat.id === 'vif' ? 'bg-blue-500' : cat.id === 'farmasi' ? 'bg-pink-500' : 'bg-green-600'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Low inventory warnings */}
                <div className="border border-gray-150 rounded-xl p-5">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-red-700 mb-3 flex items-center">
                    ⚠️ Alertes Rupture de Stock
                  </h4>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center">Tous vos stocks de Vif, Farmasi, et Arvea sont au vert ! 👍</p>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-red-50 text-red-900 text-xs rounded border border-red-100">
                          <span className="font-medium truncate max-w-[190px]">{p.name}</span>
                          <span className="font-bold font-mono">Stock: {p.stock}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <h3 className="text-base font-bold text-gray-800">Inventaire Produits</h3>
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2c2520] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#d4af37] rounded-md transition-colors cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Ajouter Produit</span>
                </button>
              </div>

              {/* Editing or Adding Form display */}
              {(editingProduct || isAdding) && (
                <form onSubmit={handleSaveProduct} className="p-5 border border-[#d4af37]/35 bg-[#faf6f0]/40 rounded-xl space-y-4 animate-scaleUp">
                  <h4 className="text-xs font-bold tracking-wider text-gray-800 uppercase">
                    {isAdding ? 'NOUVEAU PRODUIT BEAUTÉ' : `MODIFIER: ${editingProduct?.name}`}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-600 font-bold mb-1 uppercase">Nom du Produit</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={productForm.name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-bold mb-1 uppercase">Catégorie</label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleFormChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm text-[#2c2520]"
                      >
                        <option value="vif">Vif Dermacosmetics</option>
                        <option value="farmasi">Farmasi Beauty</option>
                        <option value="arvea">Arvea Nature</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 font-bold mb-1 uppercase">Sous-Catégorie</label>
                      <input
                        type="text"
                        name="subcategory"
                        required
                        value={productForm.subcategory}
                        onChange={handleFormChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                        placeholder="Ex: Anti-Aging Serums"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-600 font-bold mb-1 uppercase">Prix (TND)</label>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          required
                          value={productForm.price}
                          onChange={handleFormChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1 uppercase">Quantité Stock</label>
                        <input
                          type="number"
                          name="stock"
                          required
                          value={productForm.stock}
                          onChange={handleFormChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-gray-600 font-bold uppercase text-[10px] tracking-wider mb-1">Image du Produit (Cloudinary & Glisser-Déposer)</label>
                      
                      {/* Drag & Drop zone */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
                          dragActive 
                            ? 'border-[#d4af37] bg-[#FAF9F6]' 
                            : 'border-gray-200 hover:border-[#d4af37] bg-white'
                        }`}
                      >
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer block">
                          {uploading ? (
                            <div className="flex flex-col items-center space-y-2 py-2">
                              {/* Loading spinner */}
                              <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[11px] text-gray-500 font-mono">Téléversement sur Cloudinary sécurisé...</span>
                            </div>
                          ) : (
                            <div className="space-y-1 py-1">
                              <p className="text-xs font-semibold text-gray-700">Déposez votre image ici ou <span className="text-[#d4af37] underline font-bold">parcourez l'appareil</span></p>
                              <p className="text-[9px] text-gray-400 tracking-wider uppercase font-mono">JPG, PNG, WEBP, GIF (Max: 5 Mo)</p>
                            </div>
                          )}
                        </label>
                      </div>

                      {uploadError && (
                        <p className="text-red-600 text-[10px] font-semibold bg-red-50 border border-red-100 p-2 font-mono whitespace-pre-wrap">{uploadError}</p>
                      )}

                      {/* Display image preview if it exists */}
                      {productForm.image && (
                        <div className="flex items-center space-x-3 p-2 bg-[#FAF9F6] border border-gray-100">
                          <img 
                            src={productForm.image} 
                            alt="Aperçu du produit" 
                            className="w-14 h-14 object-cover border border-gray-200" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Lien Actif de l'Image</p>
                            <p className="text-xs text-gray-600 truncate font-mono">{productForm.image}</p>
                          </div>
                        </div>
                      )}

                      {/* Fallback Direct Link Input */}
                      <div className="pt-1">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-widest text-center my-1.5 font-mono">— OU LIEN DIRECT —</span>
                        <input
                          type="text"
                          name="image"
                          required
                          placeholder="Saisissez l'adresse URL de l'image"
                          value={productForm.image || ''}
                          onChange={handleFormChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-600 font-bold mb-1 uppercase">Description détaillée</label>
                      <textarea
                        name="description"
                        required
                        rows={3}
                        value={productForm.description}
                        onChange={handleFormChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setIsAdding(false); }}
                      className="px-4 py-1.5 border rounded text-xs text-gray-500 cursor-pointer hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#d4af37] text-white rounded text-xs font-bold cursor-pointer hover:bg-[#2c2520]"
                    >
                      Enregistrer Les Modifications
                    </button>
                  </div>
                </form>
              )}

              {/* Inventory Table List */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-[#faf6f0]">
                    <tr>
                      <th className="px-4 py-3 text-left uppercase text-gray-600 font-semibold">Produit</th>
                      <th className="px-4 py-3 text-left uppercase text-gray-600 font-semibold">Marque</th>
                      <th className="px-4 py-3 text-left uppercase text-gray-600 font-semibold">Prix</th>
                      <th className="px-4 py-3 text-center uppercase text-gray-600 font-semibold">Stock</th>
                      <th className="px-4 py-3 text-center uppercase text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center space-x-2">
                          <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded border" />
                          <span className="font-semibold text-gray-800 truncate max-w-[180px]">{p.name}</span>
                        </td>
                        <td className="px-4 py-3 uppercase font-mono text-[#d4af37]">{p.category}</td>
                        <td className="px-4 py-3 font-semibold font-mono">{p.price.toFixed(2)} DT</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold font-mono ${p.stock === 0 ? 'bg-red-100 text-red-800' : p.stock <= 5 ? 'bg-amber-100 text-[#ea580c]' : 'bg-green-100 text-green-800'}`}>
                            {p.stock} uni
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer inline"
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer inline"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-800 border-b pb-3 border-gray-100">Historique des Commandes</h3>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Aucune commande n'a été enregistrée pour le moment.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-xl bg-[#faf6f0]/30 hover:shadow-xs transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 mb-3 border-gray-200 gap-2">
                        <div>
                          <span className="text-sm font-black text-gray-800">#{order.id}</span>
                          <span className="text-xs text-gray-500 ml-3">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2 items-center">
                          <span className="text-[10px] font-mono tracking-widest text-[#d4af37] bg-white border border-[#e9dfd3] px-2 py-0.5 rounded uppercase">
                            Method: {order.paymentMethod.toUpperCase()}
                          </span>
                          
                          {/* Payment status dropdown */}
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => onUpdateOrderStatus(order.id, order.orderStatus, e.target.value)}
                            className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded bg-white text-gray-700 focus:outline-none border border-gray-300"
                          >
                            <option value="pending">PAIEMENT: PENDING</option>
                            <option value="completed">PAIEMENT: COMPLETED</option>
                            <option value="failed">PAIEMENT: FAILED</option>
                          </select>

                          {/* Order Status selector */}
                          <select
                            value={order.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value, order.paymentStatus)}
                            className="text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded bg-gray-900 text-[#d4af37] focus:outline-none cursor-pointer"
                          >
                            <option value="new">NOUVELLE (NEW)</option>
                            <option value="processing">PRÉPARATION</option>
                            <option value="shipped">EXPÉDIÉE</option>
                            <option value="delivered">LIVRÉE 🎉</option>
                            <option value="cancelled">ANNULÉE</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Items content details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        <div className="md:col-span-4 text-left">
                          <p className="font-bold text-gray-800 uppercase mb-1">Destinatrice</p>
                          <p><strong className="text-gray-700">{order.customer.name}</strong></p>
                          <p className="text-gray-500">{order.customer.phone}</p>
                          <p className="text-gray-500">{order.customer.email}</p>
                          <p className="text-gray-500">{order.customer.address}, {order.customer.city}</p>
                        </div>

                        <div className="md:col-span-6 flex flex-col justify-center text-left">
                          <p className="font-bold text-gray-800 uppercase mb-1">Articles Commande</p>
                          <div className="space-y-1 bg-white p-2 rounded border border-gray-150">
                            {order.items.map((item, id) => (
                              <div key={id} className="flex justify-between items-center py-0.5">
                                <span className="truncate max-w-[200px] text-gray-700">{item.name}</span>
                                <span className="text-gray-500 font-mono">x{item.quantity} ({item.price.toFixed(2)} DT)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col justify-center items-end bg-white p-3 rounded border border-gray-150">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Facturé</p>
                          <p className="text-base font-black text-[#d4af37] font-mono mt-1">{order.total.toFixed(2)} DT</p>
                          <span className="text-[8px] text-green-700 font-semibold mt-1">Livraison Incluse</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUPPORT CHAT HUB */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-800 border-b pb-3 border-gray-100 flex items-center justify-between">
                <span>Console Messages et Inquiries (Instant support)</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                  {chats.filter(c => c.isActive).length} files actives
                </span>
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[450px]">
                {/* Conversations list - 4 cols */}
                <div className="lg:col-span-4 border rounded-xl overflow-y-auto space-y-2 p-2 bg-[#faf6f0]/50">
                  {chats.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">Aucune discussion ouverte.</p>
                  ) : (
                    chats.map(session => (
                      <button
                        key={session.sessionId}
                        onClick={() => setSelectedChatSessionId(session.sessionId)}
                        className={`w-full p-3 rounded-lg text-left transition-all border flex flex-col space-y-1.5 cursor-pointer ${
                          selectedChatSessionId === session.sessionId
                            ? 'bg-[#2c2520] text-[#d4af37] border-[#2c2520]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4af37]/60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs truncate max-w-[120px]">{session.userName}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${session.isActive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-300 text-gray-600'}`}>
                            {session.isActive ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-[10px] opacity-75 truncate max-w-[180px]">
                          {session.messages[session.messages.length - 1]?.text || "Client connecté"}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                {/* Dialog body & Response trigger - 8 cols */}
                <div className="lg:col-span-8 border rounded-xl flex flex-col overflow-hidden bg-white">
                  {activeChat ? (
                    <div className="flex-1 flex flex-col h-full bg-slate-50 relative justify-baseline">
                      
                      {/* Chat Partner Header */}
                      <div className="p-3 bg-[#faf6f0] border-b flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">{activeChat.userName}</h4>
                          <p className="text-[9px] text-gray-500">Session: {activeChat.sessionId}</p>
                        </div>
                      </div>

                      {/* Chat histories */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                        {activeChat.messages.map((m, id) => (
                          <div 
                            key={id}
                            className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`p-2.5 rounded-lg max-w-[75%] text-xs text-left ${m.sender === 'user' ? 'bg-[#faf6f0] text-[#2c2520] border rounded-tl-none' : 'bg-[#2c2520] text-white rounded-tr-none'}`}>
                              <p className="font-semibold text-[8px] uppercase tracking-wide opacity-75 mb-0.5">
                                {m.sender === 'user' ? 'Client' : m.sender === 'admin' ? 'Conseiller Karima' : 'Assistant IA'}
                              </p>
                              <p className="whitespace-pre-wrap">{m.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* manual input message bar */}
                      <form onSubmit={handleAdminChatSend} className="p-3 bg-white border-t flex items-center space-x-2 mt-auto">
                        <input
                          type="text"
                          required
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={`Répondre en tant qu'administrateur à ${activeChat.userName}...`}
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#2c2520] text-[#d4af37] text-xs font-bold uppercase rounded hover:bg-[#d4af37] hover:text-white cursor-pointer transition-colors"
                        >
                          Envoyer
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <MessageSquare size={32} className="mb-2 text-gray-300" />
                      <p className="text-xs font-semibold uppercase">Sélectionnez une discussion active</p>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">Répondez ou consultez les historiques diagnostiques des consultations Gemini AI.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
