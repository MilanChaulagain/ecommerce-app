'use client';

import { ArrowRight, TrendingUp, Zap } from 'lucide-react';

export default function PromotionalBanners() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Featured Banner */}
        <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 md:p-12 lg:p-16 text-white shadow-2xl group cursor-pointer">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">MEGA SALE</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Up to 70% Off
              </h2>
              <p className="text-xl md:text-2xl mb-6 opacity-90">
                Summer Collection Sale - Limited Time Only
              </p>
              <button className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
            <div className="flex-shrink-0">
              <div className="text-8xl md:text-9xl lg:text-[200px] opacity-90">
                🎁
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Three Column Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Banner 1 - New Arrivals */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 md:p-8 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                NEW
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                New Arrivals
              </h3>
              <p className="text-sm md:text-base mb-4 opacity-90">
                Check out the latest products
              </p>
              <button className="inline-flex items-center text-white font-semibold hover:gap-2 transition-all">
                Explore
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 text-7xl opacity-20 transform translate-x-4 translate-y-4">
              ✨
            </div>
          </div>

          {/* Banner 2 - Best Sellers */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 md:p-8 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 text-xs font-semibold">
                <Zap className="w-3 h-3" />
                HOT
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Best Sellers
              </h3>
              <p className="text-sm md:text-base mb-4 opacity-90">
                Most popular items this month
              </p>
              <button className="inline-flex items-center text-white font-semibold hover:gap-2 transition-all">
                Shop Now
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 text-7xl opacity-20 transform translate-x-4 translate-y-4">
              🔥
            </div>
          </div>

          {/* Banner 3 - Clearance */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 md:p-8 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 text-xs font-semibold">
                💰 SAVE
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Clearance
              </h3>
              <p className="text-sm md:text-base mb-4 opacity-90">
                Up to 80% off selected items
              </p>
              <button className="inline-flex items-center text-white font-semibold hover:gap-2 transition-all">
                View Deals
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 text-7xl opacity-20 transform translate-x-4 translate-y-4">
              💸
            </div>
          </div>
        </div>

        {/* Two Column Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left Banner - Free Shipping */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Free Shipping
                </h3>
                <p className="text-base mb-4 opacity-90">
                  On orders over $50
                </p>
                <button className="inline-flex items-center bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all">
                  Learn More
                </button>
              </div>
              <div className="text-6xl">🚚</div>
            </div>
          </div>

          {/* Right Banner - Member Benefits */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Join & Save
                </h3>
                <p className="text-base mb-4 opacity-90">
                  Extra 10% off for members
                </p>
                <button className="inline-flex items-center bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all">
                  Sign Up Free
                </button>
              </div>
              <div className="text-6xl">👑</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
