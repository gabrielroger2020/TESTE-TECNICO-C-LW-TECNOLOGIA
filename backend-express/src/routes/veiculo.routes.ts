import { Router } from 'express';
import { listar, buscarPlaca, criar } from '../controllers/veiculo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, listar);
router.get('/:placa', authMiddleware, buscarPlaca);
router.post('/', authMiddleware, criar);

export default router;
