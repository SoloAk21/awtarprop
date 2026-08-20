import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { ETHIOPIAN_REGIONS } from '@awtarprop/shared';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    service: 'awtarprop-backend',
    timestamp: new Date().toISOString(),
    regionsSupportedCount: ETHIOPIAN_REGIONS.length
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

app.listen(env.PORT, () => {
  console.log(
    `🚀 AwtarProp Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`
  );
});
