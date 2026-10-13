import { Router } from 'express';
import { getDashboardStats, triggerScan } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, getDashboardStats);
router.post('/scan', authenticateToken, triggerScan);

export default router;
