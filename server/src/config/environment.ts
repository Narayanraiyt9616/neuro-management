import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export interface IConfig {
  env: string;
  port: number;
  mongoUri: string;
  clientUrl: string;
  apiPrefix: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  resetTokenExpiresMinutes: number;
  isProduction: boolean;
  isDevelopment: boolean;
}

export const config: IConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biznexus',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiPrefix: process.env.API_PREFIX || '/api',
  jwtSecret: process.env.JWT_SECRET || 'biznexus_enterprise_secure_jwt_secret_2026_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  resetTokenExpiresMinutes: parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

export default config;
