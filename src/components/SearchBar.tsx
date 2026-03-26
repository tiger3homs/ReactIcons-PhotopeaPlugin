import React from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="relative flex-1 max-w-2xl">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search icons (Ctrl+K or /)"
          className="w-full pl-10 pr-10 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FaXmark />
          </button>
        )}
      </div>
      <div className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">
        {resultCount.toLocaleString()} icons found
      </div>
    </div>
  );
}
