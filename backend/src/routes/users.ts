import { Router } from 'express';
import {
  getProfile, updateProfile, changePassword, toggleTwoFactor,
  getAllUsers, updateUserRole, toggleUserStatus,
} from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// User routes (authenticated)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);
router.put('/2fa/toggle', authenticateToken, toggleTwoFactor);

// Admin routes
router.get('/', authenticateToken, authorizeRole('ADMIN'), getAllUsers);
router.put('/:userId/role', authenticateToken, authorizeRole('ADMIN'), updateUserRole);
router.put('/:userId/status', authenticateToken, authorizeRole('ADMIN'), toggleUserStatus);

export default router;
