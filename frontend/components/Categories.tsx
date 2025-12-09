'use client';

import { ArrowRight, Package } from 'lucide-react';
import { Category } from '@/lib/types';

// Empty categories array - will be populated from backend
const categories: Category[] = [];

export default function Categories() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of products across different categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Content */}
                <div className="relative p-6 md:p-8 h-48 md:h-56 flex flex-col items-center justify-center text-white">
                  {/* Icon/Emoji */}
                  <div className="text-5xl md:text-6xl mb-3 md:mb-4 transform group-hover:scale-110 transition-transform">
                    {category.image}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-center">
                    {category.title}
                  </h3>
                  
                  {/* Item Count */}
                  <p className="text-xs md:text-sm opacity-90 mb-2 md:mb-3">
                    {category.itemCount}
                  </p>
                  
                  {/* Hover Arrow */}
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>

                {/* Decorative Border */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))
          ) : (
            // Empty State - Placeholder Cards
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300"
              >
                <div className="p-6 md:p-8 h-48 md:h-56 flex flex-col items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 text-center font-medium">
                    Category {index + 1}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">No data yet</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <button className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            View All Categories
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
