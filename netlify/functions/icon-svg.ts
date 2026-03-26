import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

export const handler: Handler = async (event) => {
  // Extract library and icon name from path
  // Path will be: /.netlify/functions/icon-svg/fa6/FaBolt
  const path = event.path.replace('/.netlify/functions/icon-svg/', '');
  const parts = path.split('/');
  const library = parts[0];  // e.g. "fa6"
  const iconName = parts[1]; // e.g. "FaBolt"

  if (!library || !iconName) {
    return { statusCode: 400, body: 'Missing library or icon name' };
  }

  try {
    // Dynamically import the correct react-icons library
    // Note: In Netlify functions, we might need to be careful with dynamic imports
    // But since we are using esbuild (default for TS functions), it should work if configured
    const iconLib = await import(`react-icons/${library}`);
    const IconComponent = iconLib[iconName];

    if (!IconComponent) {
      return { statusCode: 404, body: `Icon "${iconName}" not found in library "${library}"` };
    }

    // Get size and color from query params with defaults
    const size = parseInt(event.queryStringParameters?.size || '64');
    const color = event.queryStringParameters?.color || '#000000';
    const decodedColor = decodeURIComponent(color);

    // Render icon to SVG string
    const svgString = renderToStaticMarkup(
      createElement(IconComponent, { size, color: decodedColor })
    );

    // Ensure proper SVG with XML namespace for standalone use
    const fullSvg = svgString.replace(
      '<svg',
      `<svg xmlns="http://www.w3.org/2000/svg"`
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000' // cache 1 year
      },
      body: fullSvg
    };

  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
