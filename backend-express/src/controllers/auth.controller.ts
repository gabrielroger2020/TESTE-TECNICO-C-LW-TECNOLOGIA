import { Request, Response } from 'express';
import { z } from 'zod';
import { autenticar } from '../services/auth.service';

const loginSchema = z.strictObject({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

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
