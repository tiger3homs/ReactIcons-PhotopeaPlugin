import React from 'react';
import { FaSun, FaMoon, FaCircleQuestion } from 'react-icons/fa6';

interface ToolbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
}

export default function Toolbar({ isDark, onToggleTheme, onShowShortcuts }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="flex-1" />
      
      <button
        onClick={onShowShortcuts}
        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        title="Keyboard Shortcuts"
      >
        <FaCircleQuestion className="text-lg" />
      </button>

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
      </button>
    </div>
  );
}
