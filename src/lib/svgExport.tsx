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
