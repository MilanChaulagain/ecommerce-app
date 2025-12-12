import React from 'react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    oldPrice: number;
    discount: number;
    rating: number;
    reviews: number;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-2 relative flex flex-col">
      <span className="absolute top-2 left-2 bg-pink-100 text-pink-500 text-xs font-bold rounded px-2 py-0.5">-{product.discount}%</span>
      <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-pink-400">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13 5.36C13.5 3.99 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" /></svg>
      </button>
      <img src={product.image} alt={product.name} className="w-full h-28 object-contain mb-2 rounded" />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="font-semibold text-sm text-gray-800 leading-tight mb-1">{product.name}</div>
          <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
            <span>★ {product.rating}</span>
            <span className="text-gray-400">({product.reviews})</span>
          </div>
        </div>
        <div className="mb-2">
          <span className="text-pink-500 font-bold text-base mr-2">Rs. {product.price}</span>
          <span className="text-gray-400 line-through text-xs">Rs. {product.oldPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-yellow-400 text-white font-semibold rounded-lg py-1 text-sm hover:bg-yellow-500 transition">Buy Now</button>
          <button className="bg-pink-100 text-pink-500 rounded-lg p-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15M6 12h15M6 18h15M3 6h.01M3 12h.01M3 18h.01" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
