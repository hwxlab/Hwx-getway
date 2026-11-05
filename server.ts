/**
 * HWX Gateway - Full-Stack Express Server Entrypoint
 * Mounts Vite dev middleware in development and static assets in production
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import smsRouter from './server/routes/sms';
import devicesRouter from './server/routes/devices';
import keysRouter from './server/routes/keys';
import systemRouter from './server/routes/system';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Device-Id', 'X-Device-Token'],
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // REST API Routes
  app.use('/v1/sms', smsRouter);
  app.use('/v1/devices', devicesRouter);
  app.use('/v1/keys', keysRouter);
  app.use('/v1', systemRouter);

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HWX Gateway] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[HWX Gateway] API Health: http://0.0.0.0:${PORT}/v1/health`);
  });
}

startServer().catch(err => {
  console.error('[HWX Gateway] Server startup error:', err);
  process.exit(1);
});
