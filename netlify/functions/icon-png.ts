import { Handler } from '@netlify/functions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import sharp from 'sharp';

export const handler: Handler = async (event) => {
  const { library, name, size, color } = event.queryStringParameters || {};

  console.log('Params received:', { library, name, size, color });

  if (!library || !name) {
    return {
      statusCode: 400,
      body: `Missing params. Received: ${JSON.stringify(event.queryStringParameters)}`
    };
  }

  try {
    const iconLib = await import(`react-icons/${library}`);
    const IconComponent = iconLib[name];

    if (!IconComponent) {
      return {
        statusCode: 404,
        body: `Icon "${name}" not found in "react-icons/${library}"`
      };
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
