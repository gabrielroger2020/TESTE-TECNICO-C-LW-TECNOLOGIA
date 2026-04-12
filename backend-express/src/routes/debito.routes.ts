import { Router } from 'express';
import { listarPorPlaca, buscarPorId, criar, atualizarStatus, resumo, quitar } from '../controllers/debito.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/resumo', authMiddleware, resumo);
router.get('/veiculo/:placa', authMiddleware, listarPorPlaca);
router.get('/:id', authMiddleware, buscarPorId);
router.post('/', authMiddleware, criar);
router.patch('/:id/status', authMiddleware, atualizarStatus);
router.patch('/:id/quitar', authMiddleware, quitar);

export default router;
