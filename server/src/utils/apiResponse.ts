import { Response } from 'express';
import { IApiResponse } from '../types';

/**
 * Standardized API Response structure for BizNexus SaaS
 */
export class ApiResponse {
  /**
   * Successful response formatter
   */
  static success<T>(
    res: Response,
    data: T | null = null,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: Record<string, unknown>
  ): Response {
    const responsePayload: IApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
  }

  /**
   * Created (201) response formatter
   */
  static created<T>(
    res: Response,
    data: T | null = null,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponse.success<T>(res, data, message, 201);
  }

  /**
   * Error response formatter
   */
  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    errors: unknown = null
  ): Response {
    const responsePayload: IApiResponse<null> = {
      success: false,
      statusCode,
      message,
      data: null,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
  }
}

export default ApiResponse;

