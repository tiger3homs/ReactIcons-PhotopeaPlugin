import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from IconForge Netlify Function!" }),
  };
};

export { handler };
