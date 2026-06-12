import React from 'react';
import { X, Star, Sparkles, Check, Flame } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white border border-[#E5E5E1] overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-scaleUp">
        
        {/* Close trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer border border-[#E5E5E1]"
        >
          <X size={16} />
        </button>

        {/* Column 1: Image Showcase */}
        <div className="w-full md:w-1/2 relative bg-[#F2F1ED] aspect-square md:aspect-auto md:h-full min-h-[250px] md:min-h-[450px]">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.bestSeller && (
            <span className="absolute top-4 left-4 bg-white text-[#1A1A1A] border border-[#E5E5E1] text-[8px] font-bold tracking-widest uppercase px-3 py-1">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Column 2: Details Context */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col text-left justify-baseline">
          {/* Brand & Subcategory */}
          <div className="mb-2">
            <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#FAF9F6] border border-[#E5E5E1] px-3 py-1">
              {product.category === 'vif' ? '🧬 VIF DERMACOS' : product.category === 'farmasi' ? '💄 FARMASI BEAUTY' : '🌿 ARVEA NATURE'}
            </span>
            <span className="ml-2 text-xs text-[#6B6B6B] font-medium font-mono">{product.subcategory}</span>
          </div>

          {/* Product Name */}
          <h2 className="text-xl font-semibold text-[#1A1A1A] leading-snug font-serif mb-2">
            {product.name}
          </h2>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-4">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.floor(product.rating) ? 'fill-[#D4AF37]' : 'text-gray-200'} 
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#1A1A1A]">{product.rating.toFixed(1)} / 5.0</span>
          </div>

          {/* Price Tag */}
          <div className="flex items-baseline space-x-3 mb-4 p-3 bg-[#FAF9F6] border border-[#E5E5E1]">
            <span className="text-xl font-serif font-bold text-[#1A1A1A]">{product.price.toFixed(2)} DT</span>
            {product.oldPrice && (
              <span className="text-xs text-[#9E9E9E] line-through">{product.oldPrice.toFixed(2)} DT</span>
            )}
            <span className="text-[10px] text-green-700 font-bold tracking-wider uppercase ml-auto flex items-center">
              <Check size={14} className="mr-0.5" /> En stock ({product.stock})
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase mb-1 flex items-center">
              <Sparkles size={11} className="text-[#D4AF37] mr-1" /> Description du soin
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">{product.description}</p>
          </div>

          {/* Ingredients if available */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase mb-1">
                🔬 Composants Actifs
              </h4>
              <div className="flex flex-wrap gap-1">
                {product.ingredients.map((ing, k) => (
                  <span key={k} className="bg-[#FAF9F6] border border-[#E5E5E1] text-[#6B6B6B] text-[9px] font-medium px-2 py-0.5">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to use if available */}
          {product.howToUse && (
            <div className="mb-5">
              <h4 className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase mb-1 flex items-center">
                👉 Conseil d'application
              </h4>
              <p className="text-xs text-[#6B6B6B] italic bg-[#FAF9F6] p-2.5 border-l border-[#D4AF37]">
                {product.howToUse}
              </p>
            </div>
          )}

          {/* Call to action */}
          <div className="mt-auto">
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={isOutOfStock}
              className={`w-full py-3.5 text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#D4AF37]'
              }`}
            >
              {isOutOfStock ? 'Rupture de stock temporaire' : 'Ajouter au Panier'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
