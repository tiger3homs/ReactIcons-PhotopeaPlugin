import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Grid } from 'react-window';
import { IconMetadata } from '../lib/iconRegistry';
import IconCard from './IconCard';

interface IconGridProps {
  icons: IconMetadata[];
  selectedIconId: string | null;
  onSelectIcon: (icon: IconMetadata) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isLoading?: boolean;
}

export default function IconGrid({ icons, selectedIconId, onSelectIcon, isFavorite, onToggleFavorite, isLoading }: IconGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const columnCount = Math.max(1, Math.floor(dimensions.width / 120));
  const rowCount = Math.ceil(icons.length / columnCount);
  const columnWidth = dimensions.width / columnCount;
  const rowHeight = 120;

  const Cell = useMemo(() => ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const icon = icons[index];

    if (!icon) return null;

    return (
      <div style={{ ...style, padding: '8px' }}>
        <IconCard
          icon={icon}
          isSelected={selectedIconId === icon.id}
          isFavorite={isFavorite(icon.id)}
          onSelect={() => onSelectIcon(icon)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(icon.id);
          }}
        />
      </div>
    );
  }, [icons, columnCount, selectedIconId, isFavorite, onSelectIcon, onToggleFavorite]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] p-12 text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)]">Searching icons...</h3>
      </div>
    );
  }

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] p-12 text-center">
        <div className="text-4xl mb-4 opacity-20">🔍</div>
        <h3 className="text-lg font-medium text-[var(--text-primary)]">No icons found</h3>
        <p className="max-w-xs mt-2">Try searching for something else or check another library.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-[var(--bg-primary)]">
      {dimensions.width > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={rowHeight}
          style={{ height: dimensions.height, width: dimensions.width }}
          className="scrollbar-hide"
          cellComponent={Cell}
          cellProps={{}}
        />
      )}
    </div>
  );
}
