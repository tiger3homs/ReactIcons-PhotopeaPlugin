import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import sharp from 'sharp';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const handler: Handler = async (event) => {
  const qs = event.queryStringParameters || {};

  // event.path looks like:
  // /icons/fa6/FaSquarePhone.svg (due to splat redirect)
  // Split it and extract library + name from the path itself
  const pathParts = event.path.split('/').filter(Boolean);
  // pathParts = ['icons', 'fa6', 'FaSquarePhone.svg']

  const library = pathParts[1];                         // 'fa6'
  const rawName = pathParts[2] || '';                   // 'FaSquarePhone.svg'
  const name = rawName.replace(/\.(svg|png)$/, '');     // 'FaSquarePhone'
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
    // Use direct file path — avoids ESM export errors with react-icons
    // We use path.join with process.cwd() to find node_modules
    const iconLibPath = path.join(
      process.cwd(),
      'node_modules',
      'react-icons',
      library,
      'index.js'
    );

    const iconLib = require(iconLibPath);
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
