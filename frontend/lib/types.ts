// Product Types
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  inStock: boolean;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
}

// Flash Sale Product (extends Product)
export interface FlashSaleProduct extends Product {
  flashPrice: number;
  discountPercent: number;
  sold: number;
  stock: number;
  endTime: string;
}

// Category Type
export interface Category {
  id: number;
  title: string;
  image: string;
  bgColor: string;
  itemCount: string;
  slug?: string;
  description?: string;
}

// Cart Item Type
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

// Order Type
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
}

// Address Type
export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// User Type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'employee' | 'admin';
  createdAt: string;
}
