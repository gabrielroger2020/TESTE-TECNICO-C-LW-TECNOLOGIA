import { Request, Response } from 'express';
import {
  buscarDebitosPorPlaca,
  buscarDebitoPorId,
  criarDebito,
  atualizarStatusDebito,
  quitarDebito,
  resumoPorPlaca,
} from '../services/debito.service';
import { criarDebitoSchema, listarDebitosQuerySchema, statusDebitoSchema } from '../schemas/debito.schema';
import { idSchema, placaSchema } from '../schemas/common.schema';

export async function listarPorPlaca(req: Request, res: Response): Promise<void> {
  const parsedParams = placaSchema.safeParse(req.params);
  const parsed = listarDebitosQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  if(!parsedParams.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsedParams.error.flatten() });
    return;
  }
  
  const status = parsed.data.status as string | undefined;
  const tipo = parsed.data.tipo as string | undefined;
  
  try {
    const debitos = await buscarDebitosPorPlaca(parsedParams.data.placa, status, tipo);
    res.json(debitos);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao buscar débitos';
    res.status(msg === 'Veículo não encontrado' ? 404 : 500).json({ erro: msg });
  }
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {

  const parsed = idSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ erro: 'ID inválido', detalhes: parsed.error.flatten() });
    return;
  }

  try {
    const debito = await buscarDebitoPorId(parsed.data.id);
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

  const parsedParams = idSchema.safeParse(req.params);
  const parsed = statusDebitoSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  if (!parsedParams.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsedParams.error.flatten() });
    return;
  }

  try {
    await atualizarStatusDebito(parsedParams.data.id, parsed.data.status);
    res.json({ mensagem: 'Status atualizado com sucesso' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar status';
    res.status(msg === 'Débito não encontrado' ? 404 : 500).json({ erro: msg });
  }
}

export async function quitar(req: Request, res: Response): Promise<void> {

  const parsedParams = idSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsedParams.error.flatten() });
    return;
  }

  try{

    const debito = await quitarDebito(parsedParams.data.id);
    res.json({
      mensagem: 'Débito quitado com sucesso!',
      debito
    });

  }catch(err){

    const msg = err instanceof Error ? err.message : 'Erro ao quitar débito';

    if (msg === 'Débito não encontrado') {
      res.status(404).json({ erro: msg });
      return;
    }

    if (msg === 'Débito já foi pago') {
      res.status(409).json({ erro: msg });
      return;
    }

    res.status(500).json({ erro: msg });

  }

}

export async function resumo(req: Request, res: Response): Promise<void> {

  const parsed = placaSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  try {
    const resumoDebitos = await resumoPorPlaca(parsed.data.placa);

    res.json(resumoDebitos);

  } catch (err) {

    const msg = err instanceof Error ? err.message : 'Erro ao gerar resumo';

    if (msg === 'Veículo não encontrado') {
      res.status(404).json({ erro: msg });
      return;
    }

    res.status(500).json({ erro: msg });

  }

}
