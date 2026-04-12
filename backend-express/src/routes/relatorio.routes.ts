import { Router } from 'express';
import { inadimplencia } from '../controllers/relatorio.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/inadimplencia', authMiddleware, inadimplencia);

export default router;
