import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { handler as searchHandler } from "./netlify/functions/search.js";
import { handler as pluginConfigHandler } from "./netlify/functions/plugin-config.js";
import { handler as iconSvgHandler } from "./netlify/functions/icon-svg.js";
import { handler as iconPngHandler } from "./netlify/functions/icon-png.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock Netlify Functions for local development
  app.get("/plugin.json", async (req, res) => {
    // @ts-ignore
    const event = {
      queryStringParameters: req.query,
      httpMethod: "GET",
    };
    // @ts-ignore
    const result = await pluginConfigHandler(event, {});
    if (result && typeof result === 'object') {
      res.status(result.statusCode || 200).set(result.headers || {}).send(result.body);
    } else {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/search", async (req, res) => {
    // @ts-ignore
    const event = {
      queryStringParameters: req.query,
      httpMethod: "GET",
    };
    // @ts-ignore
    const result = await searchHandler(event, {});
    if (result && typeof result === 'object') {
      res.status(result.statusCode || 200).set(result.headers || {}).send(result.body);
    } else {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/hello", async (req, res) => {
    res.json({ message: "Hello from local mock Netlify Function!" });
  });

  // Mock icon-svg and icon-png
  app.get("/icons/:library/:name", async (req, res) => {
    const { library, name } = req.params;
    const isPng = name.endsWith('.png');
    const isSvg = name.endsWith('.svg');
    const iconName = name.replace('.png', '').replace('.svg', '');

    const event = {
      path: `/.netlify/functions/icon-${isPng ? 'png' : 'svg'}/${library}/${iconName}`,
      queryStringParameters: req.query,
      httpMethod: "GET",
    };

    const handler = isPng ? iconPngHandler : iconSvgHandler;
    // @ts-ignore
    const result = await handler(event, {});

    if (result && typeof result === 'object') {
      const headers = result.headers || {};
      res.status(result.statusCode || 200).set(headers);
      
      if (result.isBase64Encoded) {
        res.send(Buffer.from(result.body || '', 'base64'));
      } else {
        res.send(result.body);
      }
    } else {
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
