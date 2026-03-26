import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'iconforge_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((iconId: string) => {
    setFavorites(prev => 
      prev.includes(iconId) 
        ? prev.filter(id => id !== iconId)
        : [...prev, iconId]
    );
  }, []);

  const isFavorite = useCallback((iconId: string) => {
    return favorites.includes(iconId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
}
