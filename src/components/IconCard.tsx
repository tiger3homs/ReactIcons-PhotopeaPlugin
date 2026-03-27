import React from 'react';
import { motion } from 'motion/react';
import { FaHeart, FaRegHeart, FaLink } from 'react-icons/fa6';
import { IconMetadata } from '../lib/iconRegistry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IconCardProps {
  icon: IconMetadata;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  renderMode: 'svg' | 'png';
}

export default function IconCard({ icon, isSelected, isFavorite, onSelect, onToggleFavorite, renderMode }: IconCardProps) {
  const Icon = icon.component;
  const baseUrl = window.location.origin;

  if (!Icon && renderMode === 'svg') {
    return null;
  }
  
  // Use direct function URLs as fallback if redirects fail, but clean URLs are preferred
  // For the grid, we use a default size of 64
  const svgUrl = `${baseUrl}/icons/${icon.library}/${icon.name}.svg?size=64&color=%23000000`;
  const pngUrl = `${baseUrl}/icons/${icon.library}/${icon.name}.png?size=64&color=%23000000`;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', svgUrl);
    e.dataTransfer.setData('text/uri-list', svgUrl);
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(svgUrl);
    toast.success('Icon URL copied to clipboard!');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="h-full"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSelect}
        className={cn(
          "relative group flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all h-full",
          isSelected 
            ? "bg-accent/10 border-accent ring-2 ring-accent" 
            : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-accent/50"
        )}
      >
        <div className="text-3xl text-[var(--text-primary)] mb-2 group-hover:text-accent transition-colors flex items-center justify-center w-10 h-10">
          {renderMode === 'svg' ? (
            Icon ? <Icon size={32} /> : <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center text-[8px] text-red-500">ERR</div>
          ) : (
            <img 
              src={pngUrl} 
              alt={icon.name} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
        </div>
        <span className="text-[10px] text-[var(--text-secondary)] text-center truncate w-full px-1">
          {icon.name}
        </span>

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={handleCopyUrl}
            title="Copy SVG URL"
            className="p-1.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-accent border border-[var(--border-color)]"
          >
            <FaLink className="text-[10px]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={cn(
              "p-1.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all",
              isFavorite ? "text-red-500" : "text-[var(--text-secondary)] hover:text-red-500"
            )}
          >
            {isFavorite ? <FaHeart className="text-[10px]" /> : <FaRegHeart className="text-[10px]" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
