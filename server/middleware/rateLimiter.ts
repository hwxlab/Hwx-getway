/**
 * HWX Gateway - Rate Limiter Middleware
 * Sliding window rate limiting per Account & API Key
 */
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const clientWindows = new Map<string, RateLimitRecord>();
const DEFAULT_LIMIT_PER_MINUTE = 120;
const WINDOW_SIZE_MS = 60 * 1000;

export function rateLimiter(limitPerMinute = DEFAULT_LIMIT_PER_MINUTE) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.apiKeyId || req.user?.uid || req.ip || 'anonymous';
    const now = Date.now();

    let record = clientWindows.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      clientWindows.set(identifier, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < WINDOW_SIZE_MS);

    if (record.timestamps.length >= limitPerMinute) {
      const oldest = record.timestamps[0];
      const retryAfterSec = Math.ceil((WINDOW_SIZE_MS - (now - oldest)) / 1000);

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', limitPerMinute);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldest + WINDOW_SIZE_MS) / 1000));

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Rate limit of ${limitPerMinute} requests per minute exceeded. Please retry in ${retryAfterSec} seconds.`,
        },
      });
    }

    record.timestamps.push(now);

    res.setHeader('X-RateLimit-Limit', limitPerMinute);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limitPerMinute - record.timestamps.length));
    return next();
  };
}
