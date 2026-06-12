import { X, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop escape trigger */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide body */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col animate-slideLeft border-l border-[#E5E5E1]">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E5E1] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium tracking-[0.2em] text-[#1A1A1A] uppercase font-serif">VOTRE PANIER</h3>
            <span className="bg-[#FAF9F6] border border-[#E5E5E1] px-2 py-0.5 text-xs font-semibold text-[#1A1A1A]">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2 text-[#9E9E9E] hover:text-[#1A1A1A] transition-all cursor-pointer border border-[#E5E5E1]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-[#FAF9F6] border border-[#E5E5E1] text-[#9E9E9E] flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Votre panier est vide</p>
              <p className="text-xs text-[#6B6B6B]">Explorez nos gammes Vif, Farmasi, et Arvea pour le remplir.</p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-bold tracking-widest uppercase border-b border-[#D4AF37] text-[#1A1A1A] hover:text-[#D4AF37]"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.product.id}
                className="flex items-center space-x-4 p-3 bg-[#FAF9F6] border border-[#E5E5E1] hover:border-[#1A1A1A] transition-colors"
               >
                 {/* Product thumbnail */}
                 <img 
                   src={item.product.image} 
                   alt={item.product.name} 
                   className="w-16 h-16 object-cover border border-[#E5E5E1]"
                 />
 
                 {/* Info & action */}
                 <div className="flex-1 min-w-0 text-left">
                   <span className="text-[8px] font-bold tracking-widest text-[#D4AF37] uppercase">{item.product.category}</span>
                   <h4 className="text-xs font-medium text-[#1A1A1A] truncate mb-1 font-serif">{item.product.name}</h4>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold font-serif text-[#1A1A1A]">{item.product.price.toFixed(2)} DT</span>
                     
                     {/* Quantity Modifier */}
                     <div className="flex items-center border border-[#E5E5E1] bg-white rounded-none">
                       <button
                         onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                         className="px-2 py-1 text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer"
                       >
                         <Minus size={9} />
                       </button>
                       <span className="px-2 text-xs font-semibold font-mono text-[#1A1A1A]">{item.quantity}</span>
                       <button
                         onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                         disabled={item.quantity >= item.product.stock}
                         className="px-2 py-1 text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer disabled:opacity-35"
                       >
                         <Plus size={9} />
                       </button>
                     </div>
                   </div>
                 </div>
 
                 {/* Remove button */}
                 <button
                   onClick={() => onRemoveItem(item.product.id)}
                   className="p-1 px-2 text-[#9E9E9E] hover:text-[#1A1A1A] border border-[#E5E5E1] transition-colors cursor-pointer"
                   title="Supprimer"
                 >
                   <Trash2 size={12} />
                 </button>
               </div>
             ))
           )}
         </div>
 
         {/* Drawer Footer summary */}
         {cartItems.length > 0 && (
           <div className="p-6 bg-[#FAF9F6] border-t border-[#E5E5E1] space-y-4">
             
             {/* Delivery banner */}
             <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider font-semibold text-green-800 bg-green-50/50 p-2.5 border border-green-150">
               <ShieldCheck size={14} />
               <span>Livraison gratuite offerte ! 🇹🇳</span>
             </div>
 
             {/* Calculations */}
             <div className="space-y-1 text-left">
               <div className="flex justify-between text-xs text-[#6B6B6B]">
                 <span>Sous-total:</span>
                 <span className="font-serif">{total.toFixed(2)} DT</span>
               </div>
               <div className="flex justify-between text-xs text-[#6B6B6B]">
                 <span>Livraison:</span>
                 <span className="text-green-800 font-bold uppercase tracking-wider text-[10px]">Gratuite</span>
               </div>
               <div className="flex justify-between text-sm font-semibold text-[#1A1A1A] pt-2 border-t border-[#E5E5E1]">
                 <span>Total Estimé:</span>
                 <span className="font-serif text-base font-bold text-[#1A1A1A]">{total.toFixed(2)} DT</span>
               </div>
             </div>
 
             {/* Proced to Checkout */}
             <button
               onClick={() => {
                 onProceedToCheckout();
                 onClose();
               }}
               className="w-full bg-[#1A1A1A] text-white py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
             >
               <span>Passer à la Caisse</span>
               <ArrowRight size={13} />
             </button>
           </div>
         )}

      </div>
    </div>
  );
}
