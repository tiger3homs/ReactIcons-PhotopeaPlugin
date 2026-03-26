import React from 'react';
import { FaSun, FaMoon, FaCircleQuestion, FaImage, FaCode } from 'react-icons/fa6';

interface ToolbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
  renderMode: 'svg' | 'png';
  onToggleRenderMode: () => void;
}

export default function Toolbar({ 
  isDark, 
  onToggleTheme, 
  onShowShortcuts,
  renderMode,
  onToggleRenderMode
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="flex-1" />
      
      <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg p-1 mr-2">
        <button
          onClick={() => renderMode !== 'svg' && onToggleRenderMode()}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
            renderMode === 'svg' 
              ? 'bg-[var(--bg-primary)] text-accent shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FaCode className="text-sm" />
          SVG
        </button>
        <button
          onClick={() => renderMode !== 'png' && onToggleRenderMode()}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
            renderMode === 'png' 
              ? 'bg-[var(--bg-primary)] text-accent shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FaImage className="text-sm" />
          PNG
        </button>
      </div>

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
