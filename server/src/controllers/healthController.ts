import { Request, Response } from 'express';
import { getConnectionStatus } from '../config/db';
import ApiResponse from '../utils/apiResponse';
import config from '../config/environment';
import { IHealthStatusData } from '../types';

export const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
};

/**
 * Health check controller
 * Checks server process health and MongoDB connectivity
 */
export const getHealthStatus = (_req: Request, res: Response): Response => {
  const dbStatus = getConnectionStatus();
  const uptimeSeconds = process.uptime();

  const healthData: IHealthStatusData = {
    service: 'BizNexus API Gateway',
    version: '1.0.0',
    environment: config.env,
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      human: formatUptime(uptimeSeconds)
    },
    database: {
      state: dbStatus.state,
      isHealthy: dbStatus.isHealthy,
      host: dbStatus.host || 'none',
      name: dbStatus.name || 'none'
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  };

  const statusCode = 200;

  return ApiResponse.success<IHealthStatusData>(
    res,
    healthData,
    `BizNexus API is operational${!dbStatus.isHealthy ? ' (Database in resilient stand-by mode)' : ''}`,
    statusCode
  );
};

export default {
  getHealthStatus
};

