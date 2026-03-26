import { useState, useMemo, useEffect } from 'react';
import { getIconById, IconMetadata } from '../lib/iconRegistry';

export function useIconSearch(initialLibraryId = 'all') {
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryId, setLibraryId] = useState(initialLibraryId);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [apiIcons, setApiIcons] = useState<IconMetadata[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch icons from Netlify Function
  useEffect(() => {
    const fetchIcons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}&lib=${libraryId}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        
        // Map results back to components on the client
        const iconsWithComponents = data.results.map((item: any) => {
          const fullIcon = getIconById(item.id);
          return fullIcon || { ...item, component: null };
        });
        
        setApiIcons(iconsWithComponents);
        setTotalCount(data.total);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIcons();
  }, [debouncedSearch, libraryId]);

  return {
    searchTerm,
    setSearchTerm,
    libraryId,
    setLibraryId,
    filteredIcons: apiIcons,
    totalCount,
    isLoading
  };
}
