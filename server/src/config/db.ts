import mongoose, { ConnectOptions } from 'mongoose';
import config from './environment';
import logger from '../utils/logger';

import resilientAuthStore from '../services/resilientAuthStore';

let isConnected = false;

// Mask credentials for safe logging
export const getMaskedUri = (uri: string): string => {
  if (!uri) return 'not-configured';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  } catch {
    return 'configured (masked)';
  }
};

export const connectDB = async (): Promise<boolean> => {
  if (!config.mongoUri) {
    logger.warn('MONGODB_URI is not set. Database operations will be unavailable.');
    return false;
  }

  const masked = getMaskedUri(config.mongoUri);
  logger.info(`Initiating MongoDB connection to: ${masked}`);

  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    autoIndex: config.isDevelopment
  };

  try {
    const conn = await mongoose.connect(config.mongoUri, options);
    isConnected = true;
    logger.info(`MongoDB Connected successfully to host: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return true;
  } catch (error) {
    isConnected = false;
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`MongoDB connection error: ${msg}`);
    logger.warn('Server will continue running in resilient mode without active database connection.');
    return false;
  }
};

// Mongoose connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  logger.info('Mongoose connection event: CONNECTED');
  resilientAuthStore.seedMongoIfConnected().catch((err) => {
    logger.warn('Seed error on connection', err);
  });
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  logger.error('Mongoose connection event: ERROR', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('Mongoose connection event: DISCONNECTED');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose connection disconnected through app termination');
    process.exit(0);
  } catch {
    process.exit(1);
  }
});

export interface IDbConnectionStatus {
  state: string;
  isHealthy: boolean;
  host: string | null;
  name: string | null;
}

export const getConnectionStatus = (): IDbConnectionStatus => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const readyState = mongoose.connection.readyState;
  return {
    state: states[readyState] || 'unknown',
    isHealthy: readyState === 1,
    host: isConnected ? mongoose.connection.host : null,
    name: isConnected ? mongoose.connection.name : null
  };
};

export default {
  connectDB,
  getConnectionStatus
};

