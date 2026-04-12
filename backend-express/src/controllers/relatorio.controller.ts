import { Request, Response } from 'express';
import { relatorioInadimplencia } from '../services/relatorio.service';

export async function inadimplencia(_req: Request, res: Response): Promise<void> {
  try{
    const relatorio = await relatorioInadimplencia();
    res.json(relatorio);
  } catch{
    res.status(500).json({ erro: 'Erro ao gerar relatório de inadimplência' });
  }
}
