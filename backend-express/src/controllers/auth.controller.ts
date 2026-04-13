import { Request, Response } from 'express';
import { autenticar } from '../services/auth.service';
import { loginSchema } from '../schemas/auth.schema';

export async function login(req: Request, res: Response): Promise<void> {
  
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() });
    return;
  }

  try {
    const token = await autenticar(parsed.data.email, parsed.data.senha);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ erro: err instanceof Error ? err.message : 'Erro de autenticação' });
  }
}
