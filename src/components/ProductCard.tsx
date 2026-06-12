import React from 'react';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps): React.JSX.Element {
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  // Formatted brand names
  const brandLabels: Record<string, string> = {
    vif: '🔬 Vif Dermacosmetics',
    farmasi: '💄 Farmasi Beauty',
    arvea: '🌿 Arvea Nature'
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div 
      className="group bg-white border border-[#E5E5E1] overflow-hidden transition-all duration-300 flex flex-col h-full hover:border-[#1A1A1A]"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4]/[4] md:aspect-[3/4] overflow-hidden bg-[#F2F1ED] cursor-pointer" onClick={() => onViewDetails(product)}>
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {product.bestSeller && (
            <span className="bg-white text-[#1A1A1A] border border-[#E5E5E1] text-[8px] font-bold tracking-widest uppercase px-2 py-1">
              BEST SELLER
            </span>
          )}
          {product.trending && (
            <span className="bg-[#D4AF37] text-white text-[8px] font-bold tracking-widest uppercase px-2 py-1 flex items-center gap-1 shadow-xs">
              <TrendingUp size={10} /> TRENDING
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#1A1A1A] text-white text-[8px] font-bold tracking-widest uppercase px-2 py-1">
              -{discount}%
            </span>
          )}
        </div>

        {/* Stock Badges */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase border border-[#1A1A1A] px-3 py-1.5">
              Rupture de Stock
            </span>
          </div>
        )}

        {isLowStock && (
          <span className="absolute bottom-3 left-3 bg-[#E5E5E1] text-[#1A1A1A] text-[8px] font-bold tracking-widest uppercase px-2 py-0.5">
            Seulement {product.stock} restants
          </span>
        )}
      </div>

      {/* product Content info */}
      <div className="p-5 flex-1 flex flex-col text-left">
        {/* Category / Brand label */}
        <p className="text-[9px] font-bold tracking-[0.2em] text-[#9E9E9E] uppercase mb-1.5">
          {brandLabels[product.category] || product.category}
        </p>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D4AF37] cursor-pointer transition-colors duration-200 line-clamp-2 h-10 mb-2 font-serif text-[15px]"
        >
          {product.name}
        </h3>

        {/* Rating and short subcategory */}
        <div className="flex items-center justify-between mb-4 text-xs text-[#6B6B6B]">
          <span className="bg-[#F2F1ED] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-[#6B6B6B]">
            {product.subcategory}
          </span>
          <div className="flex items-center space-x-1">
            <Star size={11} className="fill-[#D4AF37] text-[#D4AF37]" />
            <span className="font-semibold text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Description summary */}
        <p className="text-xs text-[#6B6B6B] line-clamp-2 mb-4 bg-transparent leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action wrapper */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-[#F2F1ED]">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[10px] text-[#9E9E9E] line-through">
                {product.oldPrice.toFixed(2)} DT
              </span>
            )}
            <span className="text-sm font-serif font-bold text-[#1A1A1A]">
              {product.price.toFixed(2)} DT
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`cursor-pointer text-[10px] uppercase font-bold tracking-widest border-b pb-0.5 transition-all duration-300 ${
              isOutOfStock
                ? 'text-[#9E9E9E] border-[#E5E5E1] cursor-not-allowed'
                : 'text-[#1A1A1A] border-[#1A1A1A] hover:text-[#D4AF37] hover:border-[#D4AF37]'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
