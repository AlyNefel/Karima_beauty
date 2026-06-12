import React from 'react';
import { ShoppingBag, User, Sparkles, MessageSquare, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { Category } from '../types.ts';

interface HeaderProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: { name: string; email: string; isAdmin: boolean } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  onOpenSupport: () => void;
}

export default function Header({
  categories,
  activeCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  isAdminView,
  onToggleAdminView,
  onOpenSupport
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E1] shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-1 md:flex-initial">
            <button 
              onClick={() => { onSelectCategory(null); if (isAdminView) onToggleAdminView(); }}
              className="flex flex-col items-start cursor-pointer group text-left"
            >
              <h1 className="text-xl font-normal tracking-[0.2em] text-[#1A1A1A] font-serif transition-colors group-hover:text-[#D4AF37]">
                KARIMA<span className="font-semibold text-[#1A1A1A] group-hover:text-[#D4AF37]"> BEAUTY</span>
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-[#9E9E9E] uppercase">Vif • Farmasi • Arvea</p>
            </button>
          </div>

          {/* Nav Categories - Desktop */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => { onSelectCategory(null); if (isAdminView) onToggleAdminView(); }}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                !activeCategory && !isAdminView
                  ? 'text-[#1A1A1A] border-b border-[#1A1A1A]'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              Tous Les Produits
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { onSelectCategory(cat.id); if (isAdminView) onToggleAdminView(); }}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id && !isAdminView
                    ? 'text-[#1A1A1A] border-b border-[#1A1A1A]'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Admin toggle if logged in as admin */}
            {currentUser?.isAdmin && (
              <button
                onClick={onToggleAdminView}
                className={`hidden lg:flex items-center space-x-1 px-3.5 py-1.5 border text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  isAdminView
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#1A1A1A] border-[#E5E5E1] hover:border-[#1A1A1A]'
                }`}
              >
                <ShieldAlert size={12} />
                <span>{isAdminView ? 'Quitter Admin' : 'Admin Hub'}</span>
              </button>
            )}

            {/* AI Assistant quick guide */}
            <button
              onClick={onOpenSupport}
              className="flex items-center space-x-1 text-xs text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer transition-colors px-2 py-1.5"
              title="Conseillère IA"
            >
              <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
              <span className="hidden sm:inline font-semibold text-[10px] tracking-wider uppercase">Conseils IA</span>
            </button>

            {/* User action */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                  <span className="text-[11px] font-medium text-[#1A1A1A]">Bonjour, {currentUser.name.split(' ')[0]}</span>
                  {currentUser.isAdmin && <span className="text-[9px] text-[#D4AF37] uppercase tracking-wider font-bold">Admin</span>}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-[#6B6B6B] hover:text-red-600 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer flex items-center space-x-1"
                title="Mon Compte / Connexion"
              >
                <User size={16} />
                <span className="hidden md:inline text-[10px] font-semibold tracking-wider uppercase">Connexion</span>
              </button>
            )}

            {/* Shopping Bag */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer flex items-center"
              title="Panier"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[9px] font-medium rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6] border-t border-[#E5E5E1] py-4 px-6 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
                if (isAdminView) onToggleAdminView();
              }}
              className={`text-left text-xs font-semibold uppercase py-2 tracking-widest ${
                !activeCategory && !isAdminView ? 'text-[#D4AF37]' : 'text-[#6B6B6B]'
              }`}
            >
              Tous Les Produits
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                  if (isAdminView) onToggleAdminView();
                }}
                className={`text-left text-xs font-semibold uppercase py-2 tracking-widest ${
                  activeCategory === cat.id && !isAdminView ? 'text-[#D4AF37]' : 'text-[#6B6B6B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
            
            {currentUser?.isAdmin && (
              <button
                onClick={() => {
                  onToggleAdminView();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-left text-xs font-bold uppercase py-2 text-[#D4AF37]"
              >
                <ShieldAlert size={14} />
                <span>{isAdminView ? 'Quitter Admin View' : 'Admin Hub / Inventory'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
