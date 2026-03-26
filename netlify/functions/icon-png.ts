import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import sharp from 'sharp';

export const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/icon-png/', '');
  const parts = path.split('/');
  const library = parts[0];
  const iconName = parts[1];

  if (!library || !iconName) {
    return { statusCode: 400, body: 'Missing library or icon name' };
  }

  try {
    const iconLib = await import(`react-icons/${library}`);
    const IconComponent = iconLib[iconName];

    if (!IconComponent) {
      return { statusCode: 404, body: `Icon "${iconName}" not found in "${library}"` };
    }

    const size = parseInt(event.queryStringParameters?.size || '64');
    const color = event.queryStringParameters?.color || '#000000';
    const decodedColor = decodeURIComponent(color);

    // Step 1: Render SVG
    const svgString = renderToStaticMarkup(
      createElement(IconComponent, { size, color: decodedColor })
    );

    const fullSvg = svgString.replace(
      '<svg',
      `<svg xmlns="http://www.w3.org/2000/svg"`
    );

    // Step 2: Convert SVG buffer → PNG buffer via sharp
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
      isBase64Encoded: true  // required for binary responses in Netlify
    };

  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
