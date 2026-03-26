import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import sharp from 'sharp';

export const handler: Handler = async (event) => {
  const qs = event.queryStringParameters || {};

  // event.path looks like:
  // /.netlify/functions/icon/fa6/FaSquarePhone.svg
  // Split it and extract library + name from the path itself
  const pathParts = event.path.split('/').filter(Boolean);
  // pathParts might be: ['.netlify', 'functions', 'icon', 'fa6', 'FaSquarePhone.svg']
  // OR if redirected from /icons/fa6/FaSquarePhone.svg:
  // ['.netlify', 'functions', 'icon', 'fa6', 'FaSquarePhone.svg']
  
  // Find the index of 'icon' in the path to be more robust
  const iconIndex = pathParts.indexOf('icon');
  const library = pathParts[iconIndex + 1];
  const rawName = pathParts[iconIndex + 2] || '';
  const name = rawName.replace(/\.(svg|png)$/, '');
  const format = rawName.endsWith('.png') ? 'png' : 'svg';

  const size = parseInt(qs.size || '64');
  const color = decodeURIComponent(qs.color || '%23000000');

  console.log('Parsed Path:', { path: event.path, pathParts, library, name, format, size, color });

  if (!library || !name) {
    return {
      statusCode: 400,
      body: `Could not parse path. event.path was: ${event.path}. Parsed as: ${JSON.stringify({ library, name, format })}`
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
