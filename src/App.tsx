import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import IconGrid from './components/IconGrid';
import PreviewPanel from './components/PreviewPanel';
import Toolbar from './components/Toolbar';
import { useIconSearch } from './hooks/useIconSearch';
import { useFavorites } from './hooks/useFavorites';
import { IconMetadata } from './lib/iconRegistry';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { FaXmark, FaKeyboard } from 'react-icons/fa6';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('iconforge_theme');
    return saved ? saved === 'dark' : true;
  });
  const [selectedIcon, setSelectedIcon] = useState<IconMetadata | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [renderMode, setRenderMode] = useState<'svg' | 'png'>('svg');
  
  const { 
    searchTerm, 
    setSearchTerm, 
    libraryId, 
    setLibraryId, 
    filteredIcons, 
    totalCount,
    isLoading
  } = useIconSearch();

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('iconforge_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Handle favorites filtering
  const displayIcons = useMemo(() => {
    if (libraryId === 'favorites') {
      return filteredIcons.filter(icon => favorites.includes(icon.id));
    }
    return filteredIcons;
  }, [filteredIcons, libraryId, favorites]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search: / or Ctrl+K
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !e.repeat) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Escape: Close preview or clear search
      if (e.key === 'Escape') {
        if (selectedIcon) {
          setSelectedIcon(null);
        } else if (searchTerm) {
          setSearchTerm('');
        }
      }

      // Enter: Insert into Photopea
      /*
      if (e.key === 'Enter' && selectedIcon) {
        const Icon = selectedIcon.component;
        const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + 
          renderToStaticMarkup(<Icon size={128} color="#6C63FF" />).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        insertIntoPhotopea(fullSvg);
        toast.success('Inserted into Photopea!');
      }
      */

      // F: Toggle favorite
      if (e.key.toLowerCase() === 'f' && selectedIcon) {
        toggleFavorite(selectedIcon.id);
        toast.success(isFavorite(selectedIcon.id) ? 'Removed from favorites' : 'Added to favorites');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcon, searchTerm, setSearchTerm, toggleFavorite, isFavorite]);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden">
      <Toaster position="bottom-center" theme={isDark ? 'dark' : 'light'} />
      
      <Sidebar 
        activeLibrary={libraryId} 
        onSelectLibrary={setLibraryId}
        favoritesCount={favorites.length}
      />

        <main className="flex-1 flex flex-col min-w-0">
          <Toolbar 
            isDark={isDark} 
            onToggleTheme={() => setIsDark(!isDark)} 
            onShowShortcuts={() => setShowShortcuts(true)}
            renderMode={renderMode}
            onToggleRenderMode={() => setRenderMode(prev => prev === 'svg' ? 'png' : 'svg')}
          />
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            resultCount={displayIcons.length}
          />
          <IconGrid 
            icons={displayIcons}
            selectedIconId={selectedIcon?.id || null}
            onSelectIcon={setSelectedIcon}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isLoading={isLoading}
            renderMode={renderMode}
          />
        </main>

      <PreviewPanel 
        icon={selectedIcon} 
        onClose={() => setSelectedIcon(null)}
        isFavorite={selectedIcon ? isFavorite(selectedIcon.id) : false}
        onToggleFavorite={() => selectedIcon && toggleFavorite(selectedIcon.id)}
      />

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaKeyboard className="text-accent text-xl" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
                </div>
                <button onClick={() => setShowShortcuts(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <FaXmark />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <ShortcutRow keys={['/', 'Ctrl+K']} action="Focus search" />
                <ShortcutRow keys={['Esc']} action="Clear search / Close preview" />
                <ShortcutRow keys={['Enter']} action="Insert selected icon" />
                <ShortcutRow keys={['F']} action="Toggle favorite" />
                <ShortcutRow keys={['↑', '↓', '←', '→']} action="Navigate grid" />
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] text-center">
                <p className="text-xs text-[var(--text-secondary)]">Press any key to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[], action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-secondary)]">{action}</span>
      <div className="flex gap-1">
        {keys.map(key => (
          <kbd key={key} className="px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[10px] font-mono text-[var(--text-primary)] min-w-[24px] text-center">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

