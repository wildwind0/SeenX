import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
  resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  totalCount,
  resultCount,
}) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const activePlaceholder = placeholder || t('search.placeholder');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3.5 text-[#71767b] pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={activePlaceholder}
        className="w-full pl-10 pr-24 py-2.5 bg-[#202327] border border-transparent focus:border-[#1d9bf0] focus:bg-black rounded-full text-sm text-[#e7e9ea] placeholder-[#71767b] outline-none transition-all"
      />
      <div className="absolute right-3 flex items-center gap-1.5 text-xs text-[#71767b]">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-1 hover:text-white rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#2f3336] rounded text-[#71767b]">
            /
          </kbd>
        )}
        {resultCount !== undefined && totalCount !== undefined && value.trim() && (
          <span className="text-[11px] font-mono text-[#1d9bf0]">
            {resultCount} / {totalCount}
          </span>
        )}
      </div>
    </div>
  );
};
