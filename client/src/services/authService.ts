import apiClient from './api';
import {
  IApiResponse,
  IUser,
  IRegistrationInput,
  ILoginCredentials,
  IUpdateProfileData,
  IChangePasswordData
} from '../types';

export interface IAuthApiResult {
  user: IUser;
  token: string;
}

export interface IForgotPasswordResult {
  email: string;
  previewToken?: string;
  previewUrl?: string;
  expiresInMinutes?: number;
}

export interface IVerifyTokenResult {
  valid: boolean;
  expiresAt: string;
}

export const authService = {
  /**
   * Register a new user and optional business entity
   */
  async register(data: IRegistrationInput): Promise<IAuthApiResult> {
    const response = (await apiClient.post('/auth/register', data)) as unknown as IApiResponse<IAuthApiResult>;
    if (!response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(credentials: ILoginCredentials): Promise<IAuthApiResult> {
    const response = (await apiClient.post('/auth/login', credentials)) as unknown as IApiResponse<IAuthApiResult>;
    if (!response.data) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  },

  /**
   * Logout current user session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Graceful offline logout even if server unreachable
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<IUser> {
    const response = (await apiClient.get('/auth/me')) as unknown as IApiResponse<IUser>;
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch user session');
    }
    return response.data;
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email: string): Promise<IForgotPasswordResult> {
    const response = (await apiClient.post('/auth/forgot-password', {
      email
    })) as unknown as IApiResponse<IForgotPasswordResult>;
    return response.data || { email };
  },

  /**
   * Check if a reset token is valid
   */
  async verifyResetToken(token: string): Promise<IVerifyTokenResult> {
    const response = (await apiClient.get(
      `/auth/verify-reset-token/${token}`
    )) as unknown as IApiResponse<IVerifyTokenResult>;
    return response.data || { valid: true, expiresAt: '' };
  },

  /**
   * Set new password using verified reset token
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      password,
      confirmPassword
    });
  },

  /**
   * Update profile details
   */
  async updateProfile(data: IUpdateProfileData): Promise<IUser> {
    const response = (await apiClient.put('/auth/profile', data)) as unknown as IApiResponse<IUser>;
    if (!response.data) {
      throw new Error(response.message || 'Failed to update profile');
    }
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(data: IChangePasswordData): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  }
};

export default authService;

