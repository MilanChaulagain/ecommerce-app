import React from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onLogout: () => void;
  isAdmin?: boolean;
  onDashboard?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userName, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed top-6 right-2 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-56 max-w-full flex flex-col items-center border border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center text-white font-bold text-lg mb-2">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="font-semibold text-gray-800 mb-1 text-center" style={{wordBreak:'break-all'}}>{userName}</div>
        <div className="text-xs text-gray-500 mb-4 text-center">Welcome back!</div>
        {isAdmin && onDashboard && (
          <button
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium mb-2"
            onClick={onDashboard}
          >
            Dashboard
          </button>
        )}
        <button
          className="w-full py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium mb-2"
          onClick={onLogout}
        >
          Logout
        </button>
        <button
          className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
