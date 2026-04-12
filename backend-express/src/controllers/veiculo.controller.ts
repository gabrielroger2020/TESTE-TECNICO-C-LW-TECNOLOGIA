import { Request, Response } from 'express';
import { z } from 'zod';
import { listarVeiculos, buscarPorPlaca, criarVeiculo, validarPlaca } from '../services/veiculo.service';

const criarVeiculoSchema = z.object({
  placa: z.string().min(7).max(8),
  renavam: z.string().length(11),
  proprietario: z.string().min(3),
  modelo: z.string().min(2),
  ano: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  cor: z.string().min(2),
});

export async function listar(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string | undefined;

  try {
    const resultado = await listarVeiculos(page, limit, status);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar veículos' });
  }
}

export async function buscarPlaca(req: Request, res: Response): Promise<void> {
  const { placa } = req.params;

  if (!validarPlaca(placa)) {
    res.status(400).json({ erro: 'Formato de placa inválido' });
    return;
  }

  try {
    const veiculo = await buscarPorPlaca(placa);
    if (!veiculo) {
      res.status(404).json({ erro: 'Veículo não encontrado' });
      return;
    }
    res.json(veiculo);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar veículo' });
  }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarVeiculoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  if (!validarPlaca(parsed.data.placa)) {
    res.status(400).json({ erro: 'Formato de placa inválido' });
    return;
  }

  try {
    const veiculo = await criarVeiculo(parsed.data);
    res.status(201).json(veiculo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar veículo';
    res.status(msg.includes('UNIQUE') ? 409 : 500).json({ erro: msg });
  }
}
