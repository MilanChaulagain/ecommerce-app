'use client';

import { ShoppingCart, Star, Heart, Clock, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FlashSaleProduct } from '@/lib/types';

// Empty flash sales products - will be populated from backend
const flashSaleProducts: FlashSaleProduct[] = [];

export default function FlashSales() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Timer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                FLASH SALE
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Ends in:</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Limited Time Offers
            </h2>
            <p className="text-lg text-gray-600">
              Hurry up! Grab these deals before they&apos;re gone
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="bg-white rounded-lg shadow-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl md:text-3xl font-bold text-red-500">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500 font-medium">Hours</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl md:text-3xl font-bold text-red-500">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500 font-medium">Minutes</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl md:text-3xl font-bold text-red-500">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500 font-medium">Seconds</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flashSaleProducts.length > 0 ? (
            flashSaleProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    -{product.discountPercent}%
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

                  {/* Product Image */}
                  <div className="text-7xl md:text-8xl transform group-hover:scale-110 transition-transform">
                    {product.image}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
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
                    <span className="text-xl md:text-2xl font-bold text-red-500">
                      ${product.flashPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  </div>

                  {/* Stock Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Sold: {product.sold}</span>
                      <span>Available: {product.stock}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg group/button">
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/button:animate-bounce" />
                    <span className="text-sm md:text-base">Buy Now</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty State - Placeholder Cards
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-dashed border-gray-300"
              >
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                  <div className="absolute top-3 left-3 bg-gray-300 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -0%
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            View All Flash Sales
            <Clock className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
