import React, { useMemo, useRef, useEffect, useState } from 'react';
import { List } from 'react-window';
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

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    // Initial check
    updateDimensions();
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const validIcons = useMemo(() => icons.filter(icon => !!icon.component), [icons]);
  const columnCount = Math.max(1, Math.floor(dimensions.width / 120));
  const rowCount = Math.ceil(validIcons.length / columnCount);
  const rowHeight = 120;

  const Row = useMemo(() => ({ index, style }: any) => {
    const rowIcons = [];
    for (let i = 0; i < columnCount; i++) {
      const iconIndex = index * columnCount + i;
      if (iconIndex < validIcons.length) {
        rowIcons.push(validIcons[iconIndex]);
      }
    }

    return (
      <div style={style} className="flex px-4">
        {rowIcons.map((icon) => (
          <div key={icon.id} style={{ width: `${100 / columnCount}%`, padding: '8px' }}>
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
        ))}
      </div>
    );
  }, [validIcons, columnCount, selectedIconId, isFavorite, onSelectIcon, onToggleFavorite, renderMode]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] p-12 text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)]">Searching icons...</h3>
      </div>
    );
  }

  if (validIcons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] p-12 text-center">
        <div className="text-4xl mb-4 opacity-20">🔍</div>
        <h3 className="text-lg font-medium text-[var(--text-primary)]">No icons found</h3>
        <p className="max-w-xs mt-2">
          {icons.length > 0 
            ? "Icons were found but they couldn't be loaded. Try another library." 
            : "Try searching for something else or check another library."}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-[var(--bg-primary)] min-h-0 min-w-0">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <List
          rowCount={rowCount}
          rowHeight={rowHeight}
          rowComponent={Row as any}
          rowProps={{}}
          className="scrollbar-hide"
          style={{ height: dimensions.height, width: dimensions.width }}
        />
      )}
    </div>
  );
}
