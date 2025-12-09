'use client';

import { ShoppingCart, Star, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/lib/types';

// Empty products array - will be populated from backend
const products: Product[] = [];

export default function FeaturedProducts() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getBadgeColor = (badge: string) => {
    switch(badge) {
      case 'Hot': return 'bg-red-500';
      case 'New': return 'bg-green-500';
      case 'Sale': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked items just for you
            </p>
          </div>
          <button 
              className="mt-4 md:mt-0 text-blue-600 font-semibold hover:text-blue-700 flex items-center hover:cursor-pointer"
          >
            View All Products
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Product Image */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                {/* Badge */}
                <div className={`absolute top-3 left-3 ${getBadgeColor(product.badge)} text-white text-xs font-bold px-3 py-1 rounded-full z-10`}>
                  {product.badge}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10 group/heart"
                >
                  <Heart 
                    className={`w-5 h-5 transition-colors ${
                      wishlist.includes(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 group-hover/heart:text-red-500'
                    }`}
                  />
                </button>

                {/* Product Icon */}
                <div className="text-7xl md:text-8xl transform group-hover:scale-110 transition-transform">
                  {product.image}
                </div>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-2 md:mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {product.rating}
                    </span>
                  </div>
                  <span className="ml-2 text-xs md:text-sm text-gray-500">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg group/button">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/button:animate-bounce" />
                  <span className="text-sm md:text-base">Add to Cart</span>
                </button>
              </div>
            </div>
            ))
          ) : (
            // Empty State - Placeholder Cards
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-dashed border-gray-300"
              >
                {/* Empty Image Placeholder */}
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>

                {/* Empty Product Info */}
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Don't Miss Our Special Offers!
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Subscribe to get exclusive deals and updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
