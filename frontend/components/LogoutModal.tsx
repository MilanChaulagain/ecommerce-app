import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 pt-32">
      <div className="bg-white rounded-lg shadow-lg p-4 w-64 max-w-full">
        <h2 className="text-base font-semibold mb-2 text-center">Logout</h2>
        <p className="mb-4 text-center text-red-500 text-sm">Are you sure you want to logout?</p>
        <div className="flex justify-between gap-4">
          <button
            className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium text-sm"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
