// lib/clipboard.ts

// Detect if we're inside an iframe (Tampermonkey panel)
export const isIframe = window.self !== window.top;

// Copy SVG string
export function copySvg(svgString: string) {
  if (isIframe) {
    // Send to Tampermonkey to handle clipboard
    window.parent.postMessage({
      type: 'ICONFORGE_COPY_SVG',
      payload: svgString
    }, '*');
    return;
  }
  // Standalone — use clipboard directly
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  navigator.clipboard.write([new ClipboardItem({ 'image/svg+xml': blob })]).catch(console.error);
}

// Copy PNG from URL
export function copyPng(pngUrl: string) {
  if (isIframe) {
    window.parent.postMessage({
      type: 'ICONFORGE_COPY_PNG',
      payload: pngUrl
    }, '*');
    return;
  }
  // Standalone
  fetch(pngUrl)
    .then(r => r.blob())
    .then(blob => navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]))
    .catch(console.error);
}

// Insert SVG into Photopea
export function insertIntoPhotopea(svgString: string) {
  if (isIframe) {
    window.parent.postMessage({
      type: 'ICONFORGE_INSERT',
      payload: svgString
    }, '*');
    return;
  }
  const encoded = new TextEncoder().encode(svgString);
  window.postMessage(encoded.buffer, '*');
}

// Insert PNG into Photopea
export function insertPngIntoPhotopea(pngDataUrl: string) {
  if (isIframe) {
    // Send to Tampermonkey to handle insertion
    window.parent.postMessage({
      type: 'ICONFORGE_INSERT_PNG',
      payload: pngDataUrl
    }, '*');
    return;
  }
  console.log('Insert PNG not supported in standalone mode');
}
