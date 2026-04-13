import { Request, Response } from 'express';
import { listarVeiculos, buscarPorPlaca, criarVeiculo } from '../services/veiculo.service';
import { ListarVeiculosFiltros, PaginacaoParams } from '../types';
import { criarVeiculoSchema, listarVeiculosQuerySchema } from '../schemas/veiculo.schema';
import { placaSchema } from '../schemas/common.schema';

export async function listar(req: Request, res: Response): Promise<void> {
  const parsed = listarVeiculosQuerySchema.safeParse(req.query);

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
  const parsed = placaSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  try {
    const veiculo = await buscarPorPlaca(parsed.data.placa);
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

  try {
    const veiculo = await criarVeiculo(parsed.data);
    res.status(201).json(veiculo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar veículo';
    res.status(msg.includes('UNIQUE') ? 409 : 500).json({ erro: msg });
  }
}
