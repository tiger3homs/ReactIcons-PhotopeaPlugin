import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Converts a React icon component to an ArrayBuffer containing the SVG data.
 * This is the format Photopea expects for inserting vector graphics.
 */
export function iconToArrayBuffer(IconComponent: any, size: number, color: string): ArrayBuffer {
  const svg = renderToStaticMarkup(<IconComponent size={size} color={color} />);
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + svg;
  return new TextEncoder().encode(fullSvg).buffer;
}

/**
 * Sends the icon data to Photopea.
 */
export function sendToPhotopea(arrayBuffer: ArrayBuffer) {
  if (window.parent) {
    window.parent.postMessage(arrayBuffer, "*");
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
