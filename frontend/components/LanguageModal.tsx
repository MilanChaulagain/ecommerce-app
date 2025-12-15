import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  current?: string;
  onChange?: (lang: string) => void;
}

const LanguageModal: React.FC<Props> = ({ isOpen, onClose, current = 'en', onChange }) => {
  if (!isOpen) return null;

  const setLang = (l: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', l);
      window.dispatchEvent(new Event('languageChanged'));
    }
    onChange?.(l);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-11/12 max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Language</h3>
        <div className="space-y-2">
          <button
            onClick={() => setLang('en')}
            className={`w-full text-left px-4 py-2 rounded ${current === 'en' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
            English
          </button>
          <button
            onClick={() => setLang('ne')}
            className={`w-full text-left px-4 py-2 rounded ${current === 'ne' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
            नेपाली
          </button>
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
