import React from 'react';
import { CreditCard, Truck, Key, CheckCircle, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Star } from 'lucide-react';
import { CartItem, Customer, CardDetails } from '../types.ts';

interface CheckoutFormProps {
  cartItems: CartItem[];
  currentUser: { name: string; email: string; phone?: string; address?: string; city?: string } | null;
  onCheckoutComplete: (orderData: {
    customer: Customer;
    paymentMethod: 'card' | 'cod';
    cardDetails?: CardDetails;
  }) => void;
  onCancel: () => void;
  isPlacing: boolean;
}

export default function CheckoutForm({
  cartItems,
  currentUser,
  onCheckoutComplete,
  onCancel,
  isPlacing
}: CheckoutFormProps) {
  const [createAccount, setCreateAccount] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Form values
  const [customer, setCustomer] = React.useState<Customer>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'Tunis',
    createAccount: false,
    password: ''
  });

  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'cod'>('cod');
  
  const [card, setCard] = React.useState<CardDetails>({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });

  // Keep customer updated with current user if they login mid-stream
  React.useEffect(() => {
    if (currentUser) {
      setCustomer(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city
      }));
    }
  }, [currentUser]);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCreateAccount(checked);
      setCustomer(prev => ({ ...prev, [name]: checked }));
    } else {
      setCustomer(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // Formatting helper triggers
    if (name === 'number') {
      // Retain numeric digits, insert spaces of 4
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').slice(0, 5);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckoutComplete({
      customer,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? card : undefined
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left animate-fadeIn">
      <h2 className="text-xl font-medium tracking-[0.2em] text-[#1A1A1A] mb-6 font-serif uppercase">
        Finaliser Votre Commande
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main interactive Form (Form) - left 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* User information card */}
          <div className="bg-white p-6 border border-[#E5E5E1] shadow-none rounded-none">
            <h3 className="text-xs font-bold tracking-widest text-[#1A1A1A] uppercase mb-4 flex items-center">
              <Mail size={14} className="text-[#D4AF37] mr-1.5" /> 1. Informations Personnelles
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Nom Complet *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] bg-white rounded-none focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="jean@example.com"
                    className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] bg-white rounded-none focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="+216 22 456 789"
                    className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] bg-white rounded-none focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Guest account creation */}
              {!currentUser && (
                <div className="pt-2 border-t border-[#F2F1ED] mt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="createAccount"
                      checked={createAccount}
                      onChange={handleCustomerChange}
                      className="rounded-none border-[#E5E5E1] text-[#1A1A1A] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                      Créer un compte pour suivre mes livraisons
                    </span>
                  </label>

                  {createAccount && (
                    <div className="mt-3 relative animate-fadeIn p-4 bg-[#FAF9F6] border border-[#E5E5E1]">
                      <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Mot De Passe *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required={createAccount}
                          value={customer.password}
                          onChange={handleCustomerChange}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-2 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delivery coordinates card */}
          <div className="bg-white p-6 border border-[#E5E5E1] shadow-none rounded-none">
            <h3 className="text-xs font-bold tracking-widest text-[#1A1A1A] uppercase mb-4 flex items-center">
              <Truck size={14} className="text-[#D4AF37] mr-1.5" /> 2. Détails de Livraison
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Gouvernorat / Ville *</label>
                <select
                  name="city"
                  value={customer.city}
                  onChange={handleCustomerChange}
                  className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
                >
                  <option value="Tunis">Tunis</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Ben Arous">Ben Arous</option>
                  <option value="Manouba">Manouba</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Nabeul">Nabeul</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Hammamet">Hammamet</option>
                  <option value="Gabès">Gabès</option>
                  <option value="Kairouan">Kairouan</option>
                  <option value="Djerba">Djerba</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Adresse Complète *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={customer.address}
                  onChange={handleCustomerChange}
                  placeholder="Ex: 12 Rue des Jasmin, Apt 4"
                  className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* Payment method selection & Credit Card UI */}
          <div className="bg-white p-6 border border-[#E5E5E1] shadow-none rounded-none">
            <h3 className="text-xs font-bold tracking-widest text-[#1A1A1A] uppercase mb-4 flex items-center">
              <CreditCard size={14} className="text-[#D4AF37] mr-1.5" /> 3. Mode de Paiement
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 border text-left cursor-pointer transition-all rounded-none ${
                  paymentMethod === 'cod'
                    ? 'border-[#1A1A1A] bg-[#FAF9F6]'
                    : 'border-[#E5E5E1] hover:bg-[#FAF9F6]/50'
                }`}
              >
                <Truck className="text-green-800 mb-2" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Paiement Livraison (COD)</h4>
                <p className="text-[10px] text-[#6B6B6B] mt-1">Payez en espèces à l'arrivée</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border text-left cursor-pointer transition-all rounded-none ${
                  paymentMethod === 'card'
                    ? 'border-[#1A1A1A] bg-[#FAF9F6]'
                    : 'border-[#E5E5E1] hover:bg-[#FAF9F6]/50'
                }`}
              >
                <CreditCard className="text-[#D4AF37] mb-2" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Carte de Crédit En ligne</h4>
                <p className="text-[10px] text-[#6B6B6B] mt-1">Paiement crypté instantané</p>
              </button>
            </div>

            {/* Credit Card Details Module */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 animate-scaleUp">
                
                {/* Visual Card mockup */}
                <div className="relative mx-auto w-full max-w-[320px] aspect-[1.586/1] bg-[#1A1A1A] rounded-none p-6 text-white overflow-hidden flex flex-col justify-between font-mono tracking-widest uppercase mb-6 border border-[#E5E5E1]/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-white/70 opacity-80 tracking-widest uppercase">Karima Beauty Boutique</p>
                      <span className="text-[7px] text-[#D4AF37] tracking-[0.2em] uppercase font-sans">Premium Member Card</span>
                    </div>
                    {/* Chip */}
                    <div className="w-10 h-7 bg-white/10 rounded-none border border-white/20" />
                  </div>

                  {/* Card Number */}
                  <div className="text-base font-semibold tracking-wider text-center py-2 text-white">
                    {card.number || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-white/50">Titulaire</p>
                      <p className="text-xs font-medium truncate max-w-[150px] lowercase font-sans">{card.holder || 'Client Premium'}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <p className="text-[8px] text-white/50">Validité</p>
                        <p className="text-xs font-medium">{card.expiry || 'MM/AA'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/50">CVV</p>
                        <p className="text-xs font-medium">{card.cvv || '•••'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Nom sur la carte *</label>
                    <input
                      type="text"
                      name="holder"
                      required={paymentMethod === 'card'}
                      value={card.holder}
                      onChange={handleCardChange}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] uppercase font-mono bg-white text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Numéro de carte *</label>
                    <input
                      type="text"
                      name="number"
                      required={paymentMethod === 'card'}
                      value={card.number}
                      onChange={handleCardChange}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] font-mono bg-white text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Date d'expiration *</label>
                      <input
                        type="text"
                        name="expiry"
                        required={paymentMethod === 'card'}
                        value={card.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] text-center font-mono bg-white text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">CVV *</label>
                      <input
                        type="password"
                        name="cvv"
                        required={paymentMethod === 'card'}
                        value={card.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        className="w-full px-4 py-2.5 text-xs border border-[#E5E5E1] rounded-none focus:outline-none focus:border-[#1A1A1A] text-center font-mono bg-white text-[#1A1A1A]"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#6B6B6B] font-medium flex items-center space-x-1 mt-2">
                  <ShieldCheck size={14} className="text-green-800" />
                  <span>Chiffrement SSL de sécurité bancaire certifié actif.</span>
                </p>
              </div>
            )}
          </div>

          {/* Action triggers */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] hover:text-[#1A1A1A] px-4 py-2 transition-colors cursor-pointer border border-[#E5E5E1]"
            >
              Retour au Panier
            </button>
            <button
              type="submit"
              disabled={isPlacing}
              className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white text-xs font-bold tracking-widest uppercase px-8 py-3.5 rounded-none transition-all disabled:opacity-55 cursor-pointer shadow-xs"
            >
              {isPlacing ? 'Traitement en cours...' : 'Confirmer Ma Commande'}
            </button>
          </div>

        </form>

        {/* Order review / right sidebar - right 5 cols */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 border border-[#E5E5E1] space-y-4 lg:sticky lg:top-28">
            <h3 className="text-xs font-bold tracking-widest text-[#1A1A1A] uppercase border-b border-[#F2F1ED] pb-2 text-left">
              Récapitulatif de Commande
            </h3>

            {/* List of items */}
            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover border border-[#E5E5E1] bg-white"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-semibold text-[#1A1A1A] truncate">{item.product.name}</h4>
                    <p className="text-[#6B6B6B] text-[10px]">{item.quantity} x {item.product.price.toFixed(2)} DT</p>
                  </div>
                  <span className="font-bold text-[#1A1A1A] font-serif">{(item.product.price * item.quantity).toFixed(2)} DT</span>
                </div>
              ))}
            </div>

            {/* Pricing math */}
            <div className="border-t border-[#F2F1ED] pt-4 space-y-2 text-left">
              <div className="flex justify-between text-xs text-[#6B6B6B]">
                <span>Sous-total:</span>
                <span className="font-serif">{total.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between text-xs text-[#6B6B6B]">
                <span>Frais d'expédition:</span>
                <span className="text-green-800 font-bold uppercase text-[10px]">GRATUIT (Tunisie Entière)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2.5 border-t border-[#E5E5E1] border-dashed">
                <span>TOTAL COMMANDE:</span>
                <span className="text-lg font-serif text-[#1A1A1A] font-bold">{total.toFixed(2)} DT</span>
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="bg-[#FAF9F6] p-3 border border-[#E5E5E1] flex items-start space-x-2.5 text-[10px] text-[#6B6B6B] text-left">
              <Star size={16} className="text-[#D4AF37] shrink-0 fill-[#D4AF37]" />
              <div>
                <p className="font-bold uppercase text-[#1A1A1A]">Karima Beauty Garantie</p>
                <p>Vos produits d'origine Vif, Farmasi et Arvea Nature sont scellés et certifiés authentiques.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
