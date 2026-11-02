import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';

import config from './config/environment';
import { connectDB } from './config/db';
import logger from './utils/logger';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import { initializeDatabaseIndexes } from './config/dbIndexes';
import BillingService from './services/billingService';

export const app: Application = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // In development or if origin matches client URL
    if (
      config.isDevelopment ||
      origin === config.clientUrl ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-business-id', 'x-webhook-signature']
};
app.use(cors(corsOptions));

// HTTP Request Logger
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'BizNexus Smart Business Management System API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact'
    }
  });
});

// Mount modular API routes
app.use(config.apiPrefix, routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

// Start server and initialize database
export const startServer = async (): Promise<http.Server> => {
  try {
    // Initialize Database
    await connectDB();
    await initializeDatabaseIndexes();
    await BillingService.seedDefaultPlans();

    const server = app.listen(config.port, () => {
      logger.info(`BizNexus Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`Health check available at http://localhost:${config.port}${config.apiPrefix}/health`);
    });

    // Initialize real-time Socket.io server
    initSocket(server);

    // Handle unexpected rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`, err);
    });

    return server;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to launch BizNexus Server: ${msg}`, error);
    process.exit(1);
  }
};

// Start when executed directly
if (require.main === module) {
  startServer();
}

export default { app, startServer };

