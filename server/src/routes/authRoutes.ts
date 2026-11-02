import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { authenticateToken, authRateLimiter } from '../middleware/authMiddleware';

const router: Router = Router();

/**
 * Public Authentication Endpoints (Rate Limited)
 */
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', authRateLimiter, resetPassword);

/**
 * Authenticated Profile & Session Endpoints
 */
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;

