import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PluginInstaller() {
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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
    <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Install in Photopea</h3>

      {/* Step 1: Copy the URL */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--text-secondary)]">
          Step 1 — Go to <strong>Window → Plugins → Add Plugin</strong>
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          Step 2 — Paste the URL below into the input field
        </p>
      </div>

      {/* Plugin JSON URL — the simplest option */}
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

      {/* Full JSON preview with copy */}
      {loading ? (
        <p className="text-xs text-[var(--text-secondary)] animate-pulse">Loading config...</p>
      ) : (
        <div className="relative group">
          <pre className="text-[10px] bg-black/30 rounded-lg p-3 text-green-400 overflow-auto max-h-36 leading-relaxed font-mono">
            {jsonString}
          </pre>
          <button
            onClick={handleCopyJson}
            className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
            title="Copy JSON"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}
