import { Request, Response } from 'express';
import { z } from 'zod';
import { listarVeiculos, buscarPorPlaca, criarVeiculo, validarPlaca } from '../services/veiculo.service';
import { ListarVeiculosFiltros, PaginacaoParams } from '../types';

const criarVeiculoSchema = z.strictObject({
  placa: z.string().min(7).max(8),
  renavam: z.string().length(11),
  proprietario: z.string().min(3),
  modelo: z.string().min(2),
  ano: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  cor: z.string().min(2),
});

const paginacaoSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const filtroVeiculosSchema = z.strictObject({
  placa: z.string().min(7).max(8).optional(),
  proprietario: z.string().optional(),
  modelo: z.string().optional(),
  anoMin: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  anoMax: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional()
});

const listarVeiculosQuerySchema = paginacaoSchema.merge(filtroVeiculosSchema).refine((data)=> data.anoMin === undefined || data.anoMax === undefined || data.anoMin <= data.anoMax,
  {
    message: 'anoMin não pode ser maior que anoMax',
    path: ['anoMin']
  }
);

export async function listar(req: Request, res: Response): Promise<void> {
  const parsed = await listarVeiculosQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  const paginacao:PaginacaoParams = {
    page: parsed.data.page,
    limit:  parsed.data.limit
  }

  const filtros:ListarVeiculosFiltros = {
    proprietario: parsed.data.proprietario,
    modelo: parsed.data.modelo,
    anoMin: parsed.data.anoMin,
    anoMax: parsed.data.anoMax,
    placa: parsed.data.placa
  }

  try {
    const resultado = await listarVeiculos(paginacao, filtros);
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
