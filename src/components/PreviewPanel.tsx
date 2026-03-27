import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaXmark, FaArrowRight, FaCopy, FaDownload, FaHeart, FaRegHeart } from 'react-icons/fa6';
import { IconMetadata } from '../lib/iconRegistry';
import { iconToArrayBuffer, sendToPhotopea, copyToClipboard, downloadSvg } from '../lib/svgExport';
import { toast } from 'sonner';
import * as htmlToImage from 'html-to-image';

interface PreviewPanelProps {
  icon: IconMetadata | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function PreviewPanel({ icon, onClose, isFavorite, onToggleFavorite }: PreviewPanelProps) {
  const [size, setSize] = useState(128);
  const [color, setColor] = useState('#6C63FF');
  const iconRef = useRef<HTMLDivElement>(null);

  if (!icon) return null;

  const Icon = icon.component;

  const handleInsert = () => {
    const buffer = iconToArrayBuffer(Icon, size, color);
    sendToPhotopea(buffer);
    toast.success('Inserted into Photopea!');
  };

  const handleCopy = async () => {
    try {
      window.focus();
      await copyToClipboard(Icon, size, color);
      toast.success('SVG copied to clipboard!');
    } catch (err) {
      console.error('SVG Copy Error:', err);
      toast.error('Failed to copy SVG to clipboard.');
    }
  };

  const handleDownload = () => {
    downloadSvg(Icon, size, color, icon.name);
    toast.success('SVG downloaded!');
  };

  const handleDownloadPng = async () => {
    if (!iconRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(iconRef.current, {
        width: size,
        height: size,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
        }
      });
      
      const link = document.createElement('a');
      link.download = `${icon.name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG downloaded!');
    } catch (err) {
      console.error('PNG Export Error:', err);
      toast.error('Failed to generate PNG locally. Trying server...');
      
      // Fallback to server URL if client-side fails
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${icon.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyPng = async () => {
    if (!iconRef.current) return;
    
    try {
      // Ensure the window has focus before attempting clipboard operations
      window.focus();

      const blob = await htmlToImage.toBlob(iconRef.current, {
        width: size,
        height: size,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
        }
      });
      
      if (!blob) throw new Error('Failed to generate PNG blob');
      
      // Re-focus just in case the processing caused a blur
      window.focus();

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      toast.success('PNG copied to clipboard!');
    } catch (err) {
      console.error('PNG Copy Error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        toast.error('Clipboard access denied or document not focused.');
      } else {
        toast.error('Failed to copy PNG to clipboard.');
      }
    }
  };

  const baseUrl = window.location.origin;
  // Use direct function URLs as fallback if redirects fail, but clean URLs are preferred
  const svgUrl = `${baseUrl}/icons/${icon.library}/${icon.name}.svg?size=${size}&color=${encodeURIComponent(color)}`;
  const pngUrl = `${baseUrl}/icons/${icon.library}/${icon.name}.png?size=${size}&color=${encodeURIComponent(color)}`;

  const copyUrl = (url: string, type: string) => {
    try {
      window.focus();
      navigator.clipboard.writeText(url);
      toast.success(`${type} URL copied to clipboard!`);
    } catch (err) {
      console.error('URL Copy Error:', err);
      toast.error('Failed to copy URL to clipboard.');
    }
  };

  return (
    <AnimatePresence>
      {icon && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-80 h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-[var(--text-primary)] truncate pr-4">{icon.name}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            >
              <FaXmark />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Icon Preview */}
            <div className="aspect-square bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'radial-gradient(circle, var(--text-secondary) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              <div 
                ref={iconRef}
                className="flex items-center justify-center"
                style={{ 
                  color, 
                  width: `${size}px`, 
                  height: `${size}px`,
                  transform: size > 200 ? `scale(${200 / size})` : 'none',
                  transformOrigin: 'center center'
                }}
              >
                <Icon size={size} />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="16"
                      max="4096"
                      value={size}
                      onChange={(e) => setSize(Math.max(16, parseInt(e.target.value) || 16))}
                      className="w-20 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs font-mono text-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <span className="text-xs font-mono text-[var(--text-secondary)]">px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="16"
                  max="2048"
                  step="8"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleInsert}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
              >
                <span>Insert into Photopea</span>
                <FaArrowRight />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-color)] transition-all"
                >
                  <FaCopy />
                  <span>Copy SVG</span>
                </button>
                <button
                  onClick={handleCopyPng}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-color)] transition-all"
                >
                  <FaCopy />
                  <span>Copy PNG</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-color)] transition-all"
                >
                  <FaDownload />
                  <span>SVG</span>
                </button>
                <button
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-color)] transition-all border border-[var(--border-color)]"
                >
                  <FaDownload />
                  <span>PNG</span>
                </button>
              </div>

              <button
                onClick={onToggleFavorite}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] transition-all"
              >
                {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
              </button>

              <div className="pt-4 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Direct Links (Drag to Photopea)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => copyUrl(svgUrl, 'SVG')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-xs font-medium hover:bg-[var(--border-color)] transition-all border border-[var(--border-color)]"
                  >
                    <span>Copy SVG URL</span>
                  </button>
                  <button
                    onClick={() => copyUrl(pngUrl, 'PNG')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-xs font-medium hover:bg-[var(--border-color)] transition-all border border-[var(--border-color)]"
                  >
                    <span>Copy PNG URL</span>
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] italic text-center">
                  Tip: You can also drag icons from the grid directly into Photopea.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
              <span className="font-bold uppercase">Library:</span>
              <span className="bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-color)]">{icon.library.toUpperCase()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
