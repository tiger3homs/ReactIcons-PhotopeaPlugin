import React from 'react';
import { motion } from 'motion/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { IconMetadata } from '../lib/iconRegistry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IconCardProps {
  icon: IconMetadata;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export default function IconCard({ icon, isSelected, isFavorite, onSelect, onToggleFavorite }: IconCardProps) {
  const Icon = icon.component;

  return (
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
      <div className="text-3xl text-[var(--text-primary)] mb-2 group-hover:text-accent transition-colors">
        <Icon />
      </div>
      <span className="text-[10px] text-[var(--text-secondary)] text-center truncate w-full px-1">
        {icon.name}
      </span>

      <button
        onClick={onToggleFavorite}
        className={cn(
          "absolute top-2 right-2 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100",
          isFavorite ? "opacity-100 text-red-500" : "text-[var(--text-secondary)] hover:text-red-500"
        )}
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>
    </motion.div>
  );
}
