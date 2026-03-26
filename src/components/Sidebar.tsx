import React from 'react';
import { libraries } from '../lib/iconRegistry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FaHammer, FaHeart } from 'react-icons/fa6';
import PluginInstaller from './PluginInstaller';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeLibrary: string;
  onSelectLibrary: (id: string) => void;
  favoritesCount: number;
}

export default function Sidebar({ activeLibrary, onSelectLibrary, favoritesCount }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <FaHammer className="text-accent text-2xl" />
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">IconForge</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <button
          onClick={() => onSelectLibrary('all')}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            activeLibrary === 'all' 
              ? "bg-accent text-accent-foreground" 
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
          )}
        >
          <span>All Icons</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            activeLibrary === 'all' ? "bg-white/20" : "bg-[var(--bg-primary)]"
          )}>
            {libraries.reduce((acc, lib) => acc + lib.count, 0).toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => onSelectLibrary('favorites')}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            activeLibrary === 'favorites' 
              ? "bg-accent text-accent-foreground" 
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className="flex items-center gap-2">
            <FaHeart className={activeLibrary === 'favorites' ? "text-white" : "text-red-500"} />
            <span>Favorites</span>
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            activeLibrary === 'favorites' ? "bg-white/20" : "bg-[var(--bg-primary)]"
          )}>
            {favoritesCount}
          </span>
        </button>

        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] opacity-50">Libraries</p>
        </div>

        {libraries.map((lib) => (
          <button
            key={lib.id}
            onClick={() => onSelectLibrary(lib.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeLibrary === lib.id 
                ? "bg-accent text-accent-foreground" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>{lib.name}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeLibrary === lib.id ? "bg-white/20" : "bg-[var(--bg-primary)]"
            )}>
              {lib.count.toLocaleString()}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4 border-t border-[var(--border-color)]">
        <PluginInstaller />
        <p className="text-[10px] text-[var(--text-secondary)] text-center opacity-50">
          v1.0.0 • Photopea Plugin
        </p>
      </div>
    </aside>
  );
}
