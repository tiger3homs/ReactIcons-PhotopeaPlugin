import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, MousePointer2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PluginInstaller() {
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch the live generated config from our own Netlify function
  useEffect(() => {
    fetch('/plugin.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch plugin config:', err);
        setLoading(false);
      });
  }, []);

  const jsonString = config ? JSON.stringify(config, null, 2) : '';
  const pluginJsonUrl = window.location.hostname.includes('netlify.app') 
    ? `${window.location.origin}/plugin.json`
    : 'https://reacticons-photopeaplugin.netlify.app/plugin.json';

  const handleCopyJson = () => {
    try {
      window.focus();
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('JSON Copy Error:', err);
    }
  };

  const handleCopyUrl = () => {
    try {
      window.focus();
      navigator.clipboard.writeText(pluginJsonUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('URL Copy Error:', err);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] hover:bg-black/10 transition-colors"
      >
        <span>Install in Photopea</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[var(--text-secondary)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4 pt-0 space-y-4 border-t border-[var(--border-color)]/30">
              {/* Option 1: Tampermonkey (Recommended) */}
              <div className="space-y-2 mt-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-accent opacity-80">Option 1 — Userscript (Recommended)</p>
                <a
                  href="/userscript.js"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  <MousePointer2 size={14} />
                  <span>Install via Tampermonkey</span>
                </a>
              </div>

              <div className="h-px bg-[var(--border-color)] opacity-50" />

              {/* Option 2: Plugin URL */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] opacity-50">Option 2 — Native Plugin</p>
                <div className="space-y-1">
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    1. Go to <strong>Window → Plugins → Add Plugin</strong>
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    2. Paste the URL below:
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 border border-[var(--border-color)]">
                  <code className="text-[10px] text-accent flex-1 truncate font-mono">{pluginJsonUrl}</code>
                  <button
                    onClick={handleCopyUrl}
                    className="text-[var(--text-secondary)] hover:text-accent transition-colors"
                    title="Copy URL"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  
                  <a
                    href={pluginJsonUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--text-secondary)] hover:text-accent transition-colors"
                    title="Preview JSON"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Full JSON preview with copy */}
              {loading ? (
                <p className="text-xs text-[var(--text-secondary)] animate-pulse text-center">Loading config...</p>
              ) : (
                <div className="relative group">
                  <pre className="text-[9px] bg-black/30 rounded-lg p-3 text-green-400/80 overflow-auto max-h-24 leading-relaxed font-mono">
                    {jsonString}
                  </pre>
                  <button
                    onClick={handleCopyJson}
                    className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy JSON"
                  >
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
