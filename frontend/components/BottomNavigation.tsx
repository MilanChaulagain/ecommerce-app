import React from 'react';
import Link from 'next/link';
import { FaHome, FaThLarge, FaShoppingCart, FaUser } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', icon: <FaHome />, href: '/' },
  { label: 'Categories', icon: <FaThLarge />, href: '/categories' },
  { label: 'Cart', icon: <FaShoppingCart />, href: '/cart', badge: 2 },
  { label: 'Profile', icon: <FaUser />, href: '/profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-center py-2 z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center text-xs relative ${
              isActive ? 'text-pink-400' : 'text-gray-700'
            }`}
          >
            <span className="text-2xl mb-1">
              {React.cloneElement(item.icon, {
                color: isActive ? '#ec4899' : '#374151',
              })}
            </span>
            {item.badge && (
              <span className={`absolute ${item.label === 'Cart' ? 'top-0 right-0 -mt-1 -mr-2 bg-red-500' : 'top-0 right-2 bg-pink-400'} text-white text-xs rounded-full px-1 font-bold cursor-pointer hover:opacity-80`}>
                {item.badge}
              </span>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
