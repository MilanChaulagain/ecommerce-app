import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NotAuthenticatedModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-11/12 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Not authenticated</h3>
        <p className="text-sm text-gray-600 mb-4">You must be signed in as an admin to access this page.</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => {
              onClose();
              router.push('/');
            }}
          >
            Close
          </button>
          <button
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/admin/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotAuthenticatedModal;
