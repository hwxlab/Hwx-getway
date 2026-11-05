/**
 * HWX Gateway - Vercel Serverless Function Entrypoint
 * Bridges Express REST API to Vercel Serverless runtime on a single URL
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import smsRouter from '../server/routes/sms';
import devicesRouter from '../server/routes/devices';
import keysRouter from '../server/routes/keys';
import systemRouter from '../server/routes/system';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Device-Id', 'X-Device-Token'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Normalizer: Handles both /v1 and rewritten /api paths seamlessly
app.use((req, res, next) => {
  if (req.url.startsWith('/api/v1')) {
    req.url = req.url.replace('/api/v1', '/v1');
  } else if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api/', '/v1/');
  }
  next();
});

// Mount routes with /v1 prefix
app.use('/v1/sms', smsRouter);
app.use('/v1/devices', devicesRouter);
app.use('/v1/keys', keysRouter);
app.use('/v1', systemRouter);

// Fallback mounts for direct relative calls
app.use('/sms', smsRouter);
app.use('/devices', devicesRouter);
app.use('/keys', keysRouter);
app.use('/', systemRouter);

export default app;
