'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import SearchLoginUserButton from '@/components/SearchLoginUserButton';

const popularSearches = ['Toys', 'Books', 'Clothing', 'School Bags', 'Baby Care'];
const products = [
  {
    id: 1,
    name: 'Educational Building Blocks Set',
    price: 1299,
    oldPrice: 1624,
    discount: 20,
    rating: 4.8,
    reviews: 234,
    image: '/products/blocks.png',
  },
  {
    id: 2,
    name: 'Kids Cotton T-Shirt Collection',
    price: 899,
    oldPrice: 1058,
    discount: 15,
    rating: 4.6,
    reviews: 456,
    image: '/products/tshirt.png',
  },
  {
    id: 3,
    name: 'Story Book Collection Bundle',
    price: 499,
    oldPrice: 665,
    discount: 25,
    rating: 4.7,
    reviews: 120,
    image: '/products/books.png',
  },
  {
    id: 4,
    name: 'Premium School Backpack',
    price: 899,
    oldPrice: 999,
    discount: 10,
    rating: 4.5,
    reviews: 98,
    image: '/products/bag.png',
  },
];

function SearchHeader() {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-br from-pink-400 to-pink-300 p-4 rounded-b-3xl flex items-center gap-3 relative">
      <button onClick={() => router.back()} className="text-white text-2xl mr-2">
        <ArrowLeft />
      </button>
      <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white p-1" />
      <div className="flex-1 ml-2">
        <div className="text-white font-bold text-lg leading-tight">Search<br />Products</div>
      </div>
      <button className="relative mx-2">
        <Bell className="text-white" />
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-white rounded-full px-1">2</span>
      </button>
      <ShoppingCart className="text-white mx-2" />
      <SearchLoginUserButton />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center bg-white rounded-xl shadow px-4 py-2 mt-4 mb-2">
      <input
        className="flex-1 bg-transparent outline-none text-gray-700"
        placeholder="Search for products..."
      />
      <button className="ml-2 text-pink-400 bg-pink-50 p-2 rounded-full">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
      </button>
    </div>
  );
}

function PopularSearches() {
  return (
    <div className="mb-4">
      <div className="font-semibold text-gray-800 mb-2">Popular Searches</div>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map((item) => (
          <button key={item} className="bg-white border border-gray-200 rounded-full px-4 py-1 text-sm text-gray-700 hover:bg-pink-50 transition">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductGrid() {
  return (
    <div>
      <div className="font-semibold text-gray-800 mb-2">All Products</div>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function SearchProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SearchHeader />
      <div className="max-w-md mx-auto px-4">
        <SearchBar />
        <PopularSearches />
        <ProductGrid />
      </div>
    </div>
  );
}
