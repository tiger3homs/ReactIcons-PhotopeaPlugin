import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

export const handler: Handler = async (event) => {
  // Read from query params — set by netlify.toml redirect
  const { library, name, size, color } = event.queryStringParameters || {};

  console.log('Params received:', { library, name, size, color });

  if (!library || !name) {
    return {
      statusCode: 400,
      body: `Missing params. Received: ${JSON.stringify(event.queryStringParameters)}`
    };
  }

  try {
    // Dynamically import the correct react-icons library
    const iconLib = await import(`react-icons/${library}`);
    const IconComponent = iconLib[name];

    if (!IconComponent) {
      return {
        statusCode: 404,
        body: `Icon "${name}" not found in "react-icons/${library}"`
      };
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
