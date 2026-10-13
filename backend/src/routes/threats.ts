import { Router } from 'express';
import {
  getThreats, getThreatById, updateThreatStatus,
  createThreat, getSecurityLogs,
} from '../controllers/threatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getThreats);
router.get('/logs', authenticateToken, getSecurityLogs);
router.get('/:id', authenticateToken, getThreatById);
router.post('/', authenticateToken, createThreat);
router.put('/:id/status', authenticateToken, updateThreatStatus);

export default router;
