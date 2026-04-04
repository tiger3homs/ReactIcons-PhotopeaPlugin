// ==UserScript==
// @name         IconForge — React Icons for Photopea (Ultimate)
// @namespace    https://reacticons-photopeaplugin.netlify.app
// @version      3.0.0
// @description  Browse and insert React Icons as SVG/PNG directly into Photopea
// @author       IconForge
// @match        https://www.photopea.com/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────
  const PLUGIN_URL  = 'https://reacticons-photopeaplugin.netlify.app';
  const PANEL_WIDTH = 320;
  const PANEL_ID    = 'iconforge-panel';
  const BTN_ID      = 'iconforge-btn';

  // ─── Inject Floating Button ───────────────────────────────
  function injectButton() {
    if (document.getElementById(BTN_ID)) return;

    const btn = document.createElement('div');
    btn.id = BTN_ID;
    btn.title = 'IconForge — React Icons (Alt+I)';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span>IconForge</span>
    `;

    Object.assign(btn.style, {
      position:      'fixed',
      top:           '50%',
      right:         '0',
      transform:     'translateY(-50%)',
      zIndex:        '99999',
      background:    '#6C63FF',
      color:         '#fff',
      padding:       '10px 6px',
      borderRadius:  '8px 0 0 8px',
      cursor:        'pointer',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           '6px',
      fontSize:      '9px',
      fontFamily:    'Inter, sans-serif',
      fontWeight:    '600',
      boxShadow:     '-2px 0 12px rgba(108,99,255,0.4)',
      userSelect:    'none',
      transition:    'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    });

    btn.onclick = togglePanel;
    document.body.appendChild(btn);
  }

  // ─── Create Sliding Panel ─────────────────────────────────
  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'iconforge-backdrop';
    Object.assign(backdrop.style, {
      position: 'fixed', inset: '0', zIndex: '99997',
      background: 'rgba(0,0,0,0.4)', display: 'none', backdropFilter: 'blur(2px)',
    });
    backdrop.onclick = closePanel;

    // Panel
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      position: 'fixed', top: '0', right: `-${PANEL_WIDTH}px`,
      width: `${PANEL_WIDTH}px`, height: '100vh', zIndex: '99998',
      background: '#1a1a2e', boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
    });

    // Header
    const header = document.createElement('div');
    header.style.cssText = `padding:12px 16px; background:#16213e; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08);`;
    header.innerHTML = `
      <div style="color:#fff; font-family:Inter,sans-serif; font-size:13px; font-weight:700;">IconForge</div>
      <button id="iconforge-close" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
    `;

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'iconforge-iframe';
    iframe.src = PLUGIN_URL;
    iframe.allow = 'clipboard-read; clipboard-write';
    Object.assign(iframe.style, { width: '100%', flex: '1', border: 'none', background: '#1a1a2e' });

    // Status Bar
    const status = document.createElement('div');
    status.id = 'iconforge-status';
    Object.assign(status.style, {
      padding: '8px', background: '#16213e', color: '#4ade80',
      fontSize: '11px', textAlign: 'center', display: 'none', fontFamily: 'Inter, sans-serif'
    });

    panel.appendChild(header);
    panel.appendChild(iframe);
    panel.appendChild(status);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    document.getElementById('iconforge-close').onclick = closePanel;
    window.addEventListener('message', handleMessage);
  }

  // ─── Message Handler (The Logic) ──────────────────────────
  async function handleMessage(event) {
    if (!event.origin.includes('netlify.app')) return;

    const { type, payload, svg } = event.data || {};
    const data = payload || svg;
    if (!type || !data) return;

    switch (type) {
      // HANDLE SVG INSERTION
      case 'ICONFORGE_INSERT':
      case 'INSERT_ICON': {
        // We use the Photopea Scripting API to ensure it opens as a layer
        // The 'true' parameter tells Photopea to import into the current project
        const script = `app.open(\`${data}\`, null, true);`;
        window.postMessage(script, "*");
        showStatus('✓ SVG inserted');
        break;
      }

      // HANDLE PNG DATA URL INSERTION
      case 'ICONFORGE_INSERT_PNG': {
        // This takes your Base64 PNG and opens it directly as a layer
        const script = `app.open("${data}", null, true);`;
        window.postMessage(script, "*");
        showStatus('✓ PNG inserted');
        break;
      }

      // HANDLE CLIPBOARD COPY
      case 'ICONFORGE_COPY_SVG': {
        if (typeof GM_setClipboard !== 'undefined') {
          GM_setClipboard(data, 'text');
          showStatus('✓ Copied to clipboard');
        }
        break;
      }
    }
  }

  // ─── UI Helpers ───────────────────────────────────────────
  function showStatus(msg) {
    const s = document.getElementById('iconforge-status');
    if (!s) return;
    s.textContent = msg;
    s.style.display = 'block';
    setTimeout(() => { s.style.display = 'none'; }, 3000);
  }

  function openPanel() {
    document.getElementById(PANEL_ID).style.right = '0';
    document.getElementById('iconforge-backdrop').style.display = 'block';
    document.getElementById(BTN_ID).style.right = PANEL_WIDTH + 'px';
  }

  function closePanel() {
    document.getElementById(PANEL_ID).style.right = `-${PANEL_WIDTH}px`;
    document.getElementById('iconforge-backdrop').style.display = 'none';
    document.getElementById(BTN_ID).style.right = '0';
  }

  function togglePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) { createPanel(); setTimeout(openPanel, 50); }
    else { panel.style.right === '0px' ? closePanel() : openPanel(); }
  }

  // Keyboard Alt+I
  document.addEventListener('keydown', (e) => { if (e.altKey && e.key === 'i') togglePanel(); });

  // Init
  if (document.readyState === 'complete') injectButton();
  else window.addEventListener('load', injectButton);

})();