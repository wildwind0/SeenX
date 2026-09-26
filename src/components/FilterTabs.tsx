import React from 'react';
import { FilterCategory } from '../types';
import { Star, FileText, BookOpen, Play, Repeat2, Layers, LayoutGrid } from 'lucide-react';
import { useI18n } from '../i18n';

interface FilterTabsProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
  counts?: Partial<Record<FilterCategory, number>>;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ selected, onSelect, counts = {} }) => {
  const { t } = useI18n();

  const tabs: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('categories.all'), icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'starred', label: t('categories.starred'), icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'standard', label: t('categories.standard'), icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'article', label: t('categories.article'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'video', label: t('categories.video'), icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'quote', label: t('categories.quote'), icon: <Repeat2 className="w-3.5 h-3.5" /> },
    { id: 'thread', label: t('categories.thread'), icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {tabs.map((tab) => {
        const isSelected = selected === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-[#e7e9ea] text-black font-bold shadow'
                : 'bg-[#202327]/80 text-[#71767b] hover:bg-[#202327] hover:text-[#e7e9ea]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-black/10 text-black' : 'bg-[#2f3336] text-[#71767b]'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
