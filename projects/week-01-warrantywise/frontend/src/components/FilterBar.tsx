import React from 'react';
import { Search, LayoutGrid, Table as TableIcon, Download, X } from 'lucide-react';
import { ApiService } from '../services/api';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedWarrantyStatus: string;
  onWarrantyStatusChange: (status: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalResults: number;
}

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Home Appliances',
  'Furniture',
  'Tools',
  'Clothing',
  'Automotive',
  'General',
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Records' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { id: 'EXPIRED', label: 'Expired' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedWarrantyStatus,
  onWarrantyStatusChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  return (
    <div className="space-y-3.5 mb-6">
      {/* Top Controls: Search, View Mode, and Exports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar (Linear Style) */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merchant, product, invoice #..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-all"
          />
          {search ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 border border-white/[0.05]">
              /
            </span>
          )}
        </div>

        {/* View Switcher & Export CTAs */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Segmented Grid / Table Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900/90 border border-white/[0.08]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Ledger Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Ledger</span>
            </button>
          </div>

          {/* Export CSV */}
          <a
            href={ApiService.getExportCsvUrl()}
            download="warrantywise_records.csv"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900/80 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all shadow-sm"
            title="Download CSV export"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>CSV</span>
          </a>

          {/* Export JSON */}
          <a
            href={ApiService.getExportJsonUrl()}
            download="warrantywise_records.json"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900/80 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all shadow-sm"
            title="Download JSON export"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>JSON</span>
          </a>
        </div>
      </div>

      {/* Filter Row: Category Pills & Status Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/[0.04]">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-zinc-500 mr-1.5 font-mono-numbers hidden md:inline">
            {totalResults} items
          </span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => onWarrantyStatusChange(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                selectedWarrantyStatus === s.id
                  ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 border border-white/[0.05]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
