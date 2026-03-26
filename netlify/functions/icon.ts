import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import sharp from 'sharp';

export const handler: Handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const library = qs.library;
  const name = qs.name;
  const size = parseInt(qs.size || '64');
  const color = decodeURIComponent(qs.color || '%23000000');
  const format = (qs.format || 'svg').toLowerCase(); // "svg" or "png"

  console.log('Unified Icon Request:', { library, name, size, color, format });

  if (!library || !name) {
    return {
      statusCode: 400,
      body: `Missing library or name. Got: ${JSON.stringify(qs)}`
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

    // Render icon to SVG string
    const svgString = renderToStaticMarkup(
      createElement(IconComponent, { size, color })
    );

    // Ensure proper SVG with XML namespace for standalone use
    const fullSvg = svgString.replace(
      '<svg',
      `<svg xmlns="http://www.w3.org/2000/svg"`
    );

    // Return SVG
    if (format === 'svg') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=31536000'
        },
        body: fullSvg
      };
    }

    // Return PNG
    const pngBuffer = await sharp(Buffer.from(fullSvg))
      .resize(size, size)
      .png()
      .toBuffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000'
      },
      body: pngBuffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (err: any) {
    console.error('Unified Icon Error:', err);
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};
