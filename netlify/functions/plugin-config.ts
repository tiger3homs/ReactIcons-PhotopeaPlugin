import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Netlify injects the deploy URL automatically as an environment variable
  // DEPLOY_URL is set per-deploy (includes branch deploys)
  // URL is the primary production URL
  const baseUrl = process.env.DEPLOY_URL || process.env.URL || 'http://localhost:3000';

  const pluginConfig = {
    name: "IconForge",
    url: baseUrl,
    icon: `${baseUrl}/logo-32.svg`
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400"
    },
    body: JSON.stringify(pluginConfig, null, 2)
  };
};
