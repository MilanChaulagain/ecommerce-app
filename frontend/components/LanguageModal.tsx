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

  // Small popover style, positioned below the button (parent must be relative)
  return (
    <div className="absolute z-50 mt-2 right-0 min-w-[120px] w-32 bg-white rounded-lg shadow-xl border border-gray-200 p-2 animate-fade-in-down cursor-pointer" style={{top: '100%'}}>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setLang('en')}
          className={`w-full text-left px-3 py-1.5 rounded text-blue-400 text-sm ${current === 'en' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'}`}
        >
          English
        </button>
        <button
          onClick={() => setLang('ne')}
          className={`w-full text-left px-3 py-1.5 rounded text-blue-400 text-sm ${current === 'ne' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'}`}
        >
          नेपाली
        </button>
      </div>
    </div>
  );
};

export default LanguageModal;
