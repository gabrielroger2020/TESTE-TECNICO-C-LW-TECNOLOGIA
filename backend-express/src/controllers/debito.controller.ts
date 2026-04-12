import { Request, Response } from 'express';
import { z } from 'zod';
import {
  buscarDebitosPorPlaca,
  buscarDebitoPorId,
  criarDebito,
  atualizarStatusDebito,
} from '../services/debito.service';

const criarDebitoSchema = z.strictObject({
  veiculo_id: z.number().int().positive(),
  tipo: z.enum(['IPVA', 'MULTA', 'LICENCIAMENTO', 'DPVAT']),
  descricao: z.string().min(3),
  valor: z.number().positive(),
  multa_percentual: z.number().min(0).default(0),
  juros_percentual: z.number().min(0).default(0),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']).default('PENDENTE'),
});

const listarDebitosQuerySchema = z.strictObject({
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']).optional(),
  tipo: z.enum(['IPVA','MULTA','LICENCIAMENTO','DPVAT']).optional()
});

export async function listarPorPlaca(req: Request, res: Response): Promise<void> {
  const { placa } = req.params;
  const parsed = listarDebitosQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }
  
  const status = parsed.data.status as string | undefined;
  const tipo = parsed.data.tipo as string | undefined;
  
  try {
    const debitos = await buscarDebitosPorPlaca(placa, status, tipo);
    res.json(debitos);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao buscar débitos';
    res.status(msg === 'Veículo não encontrado' ? 404 : 500).json({ erro: msg });
  }
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: 'ID inválido' });
    return;
  }

  try {
    const debito = await buscarDebitoPorId(id);
    if (!debito) {
      res.status(404).json({ erro: 'Débito não encontrado' });
      return;
    }
    res.json(debito);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar débito' });
  }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarDebitoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  try {
    const debito = await criarDebito(parsed.data);
    res.status(201).json(debito);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar débito' });
  }
}

export async function atualizarStatus(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const statusSchema = z.strictObject({ status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']) });

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success || isNaN(id)) {
    res.status(400).json({ erro: 'Dados inválidos' });
    return;
  }

  try {
    await atualizarStatusDebito(id, parsed.data.status);
    res.json({ mensagem: 'Status atualizado com sucesso' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar status';
    res.status(msg === 'Débito não encontrado' ? 404 : 500).json({ erro: msg });
  }
}

export async function resumo(req: Request, res: Response): Promise<void> {
  res.status(501).json({ erro: 'Não implementado' });
}
