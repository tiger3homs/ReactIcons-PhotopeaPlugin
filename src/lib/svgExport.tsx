import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Generates the full SVG string for an icon.
 */
export function getIconSvg(IconComponent: any, size: number, color: string): string {
  const svg = renderToStaticMarkup(<IconComponent size={size} color={color} />);
  // Ensure the SVG has the correct namespace for standalone use
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + 
    svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return fullSvg;
}

/**
 * Converts a React icon component to an ArrayBuffer containing the SVG data.
 * This is the format Photopea expects for inserting vector graphics.
 */
export function iconToArrayBuffer(IconComponent: any, size: number, color: string): ArrayBuffer {
  const fullSvg = getIconSvg(IconComponent, size, color);
  return new TextEncoder().encode(fullSvg).buffer;
}

/**
 * Sends the icon data to Photopea.
 * Supports both native Photopea plugin context and Tampermonkey script context.
 */
export function sendToPhotopea(IconComponent: any, size: number, color: string) {
  const fullSvg = getIconSvg(IconComponent, size, color);
  const buffer = new TextEncoder().encode(fullSvg).buffer;

  if (window.parent !== window) {
    // 1. Send as object for Tampermonkey script
    window.parent.postMessage({
      type: 'INSERT_ICON',
      svg: fullSvg
    }, '*');

    // 2. Send as raw ArrayBuffer for native Photopea plugin
    window.parent.postMessage(buffer, "*");
  } else {
    // Standalone mode (e.g. testing in a tab)
    const encoded = new TextEncoder().encode(fullSvg);
    window.postMessage(encoded.buffer, '*');
  }
}

/**
 * Copies the raw SVG string to the clipboard.
 */
export async function copyToClipboard(IconComponent: any, size: number, color: string) {
  const svg = renderToStaticMarkup(<IconComponent size={size} color={color} />);
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + svg;
  await navigator.clipboard.writeText(fullSvg);
}

/**
 * Triggers a file download for the SVG.
 */
export function downloadSvg(IconComponent: any, size: number, color: string, name: string) {
  const svg = renderToStaticMarkup(<IconComponent size={size} color={color} />);
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + svg;
  const blob = new Blob([fullSvg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
