'use client';

import { useState, useRef } from 'react';
import { User } from 'lucide-react';
import LoginModal from './LoginModal';

export default function SearchLoginUserButton() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const userMenuRef = useRef(null);

  // You can add logic to check login status and fetch user info here if needed

  return (
    <>
      {!isLoggedIn ? (
        <>
          <button
            className="bg-white bg-opacity-30 text-white px-4 py-1 rounded-full font-semibold ml-2"
            onClick={() => setShowLoginModal(true)}
          >
            <User className="inline-block mr-1" size={18} /> Login
          </button>
          {showLoginModal && (
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
          )}
        </>
      ) : (
        <div ref={userMenuRef}>
          <button
            className="bg-white bg-opacity-30 text-white px-4 py-1 rounded-full font-semibold ml-2"
            // Add user menu logic here if needed
          >
            <span className="inline-block bg-gradient-to-br from-pink-400 to-pink-300 text-white rounded-full w-6 h-6 text-center font-bold mr-1">
              {userName.charAt(0).toUpperCase()}
            </span>
            {userName}
          </button>
        </div>
      )}
    </>
  );
}
