import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { inicializarBanco } from './database/db';
import authRoutes from './routes/auth.routes';
import veiculoRoutes from './routes/veiculo.routes';
import debitoRoutes from './routes/debito.routes';
import relatorioRoutes from './routes/relatorio.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/debitos', debitoRoutes);
app.use('/api/relatorios', relatorioRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

inicializarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Falha ao inicializar banco de dados:', err);
  process.exit(1);
});

export default app;
