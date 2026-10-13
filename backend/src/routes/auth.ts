import { Router } from 'express';
import {
  register, login, logout, verifyOtp, sendOtp,
  refreshAccessToken, oauthCallback,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/refresh', refreshAccessToken);
router.post('/oauth/callback', oauthCallback);

export default router;
