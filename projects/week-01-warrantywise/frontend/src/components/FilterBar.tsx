import React from 'react';
import { Search, LayoutGrid, Table as TableIcon, FileSpreadsheet, FileCode, X } from 'lucide-react';
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
  { id: 'ALL', label: 'All Status' },
  { id: 'ACTIVE', label: 'Active Coverage' },
  { id: 'EXPIRING_SOON', label: 'Expiring Soon (≤30d)' },
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
    <div className="space-y-4 mb-6">
      {/* Top Bar: Search, View Mode, and Exports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merchant, invoice #, notes..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View mode toggle & Export dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Layout Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dense Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV */}
          <a
            href={ApiService.getExportCsvUrl()}
            download="warrantywise_records.csv"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            title="Download CSV export"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </a>

          {/* Export JSON */}
          <a
            href={ApiService.getExportJsonUrl()}
            download="warrantywise_records.json"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            title="Download JSON export"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </a>
        </div>
      </div>

      {/* Filter Pills: Categories and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown/Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1 hidden md:inline">
            {totalResults} items
          </span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => onWarrantyStatusChange(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedWarrantyStatus === s.id
                  ? 'bg-slate-200 text-slate-950 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
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
