import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import config from '../config/environment';
import { IJwtPayload, IPasswordResetTokenDocument } from '../types';
import PasswordResetToken from '../models/PasswordResetToken';

export const tokenService = {
  /**
   * Sign a standard JWT token for authenticated requests
   */
  generateJwt(payload: IJwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn']
    });
  },

  /**
   * Verify and decode a JWT token
   */
  verifyJwt(token: string): IJwtPayload {
    return jwt.verify(token, config.jwtSecret) as IJwtPayload;
  },

  /**
   * Generate a secure random reset token
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Generate and persist a cryptographic password reset token
   */
  async createPasswordResetToken(userId: Types.ObjectId): Promise<string> {
    // Invalidate existing unused tokens for this user
    await PasswordResetToken.updateMany(
      { userId, used: false },
      { $set: { used: true } }
    );

    // Generate 64-char random hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.resetTokenExpiresMinutes * 60 * 1000);

    await PasswordResetToken.create({
      userId,
      token,
      expiresAt,
      used: false
    });

    return token;
  },

  /**
   * Verify an active, non-expired password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<IPasswordResetTokenDocument | null> {
    const record = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    return record;
  },

  /**
   * Mark a reset token as consumed
   */
  async markTokenUsed(token: string): Promise<void> {
    await PasswordResetToken.updateOne(
      { token },
      { $set: { used: true } }
    );
  }
};

export default tokenService;
