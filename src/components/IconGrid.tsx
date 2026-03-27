import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { IconMetadata } from '../lib/iconRegistry';
import IconCard from './IconCard';

interface IconGridProps {
  icons: IconMetadata[];
  selectedIconId: string | null;
  onSelectIcon: (icon: IconMetadata) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isLoading?: boolean;
  renderMode: 'svg' | 'png';
}

export default function IconGrid({ icons, selectedIconId, onSelectIcon, isFavorite, onToggleFavorite, isLoading, renderMode }: IconGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(containerRef.current);
    updateDimensions();

    return () => observer.disconnect();
  }, [isLoading, icons.length]);

  const columnCount = Math.max(1, Math.floor(dimensions.width / 120));
  const rowCount = Math.ceil(icons.length / columnCount);
  const columnWidth = dimensions.width > 0 ? dimensions.width / columnCount : 120;
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
          renderMode={renderMode}
        />
      </div>
    );
  }, [icons, columnCount, selectedIconId, isFavorite, onSelectIcon, onToggleFavorite, renderMode]);

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
    <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden bg-[var(--bg-primary)]">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={rowHeight}
          height={dimensions.height}
          width={dimensions.width}
          className="scrollbar-hide"
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
}
