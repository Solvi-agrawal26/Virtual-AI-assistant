import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import apiRouter from './routes';
import askRouter from './routes/ask.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { AppError } from './utils/appError';

export const createApp = (): Application => {
  const app = express();

  // 1. Security & Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS configuration
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow during dev / configurable
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body & Cookie Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // 4. Logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // 5. Global Rate Limiter
  app.use('/api', apiLimiter);

  // Direct /api/ask endpoint
  app.use('/api/ask', askRouter);

  // 6. Mount Master API
  app.use('/api/v1', apiRouter);

  // Root welcome
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Virtual AI Assistant API',
      status: 'operational',
      documentation: '/api/v1/health',
    });
  });

  // 7. 404 Route handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl}`));
  });

  // 8. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
