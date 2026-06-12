export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: 'vif' | 'farmasi' | 'arvea';
  subcategory: string;
  image: string;
  rating: number;
  stock: number;
  trending: boolean;
  bestSeller: boolean;
  ingredients?: string[];
  howToUse?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  createAccount: boolean;
  password?: string;
}

export interface CardDetails {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    category: string;
  }[];
  total: number;
  customer: Customer;
  paymentMethod: 'card' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  cardDetailsMasked?: {
    numberMasked: string;
    holder: string;
  };
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'ai';
  text: string;
  date: string;
}

export interface ChatSession {
  sessionId: string;
  userName: string;
  userEmail?: string;
  messages: ChatMessage[];
  lastUpdated: string;
  isActive: boolean;
}

export interface UserAccount {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  passwordHash?: string;
  dateCreated: string;
}
