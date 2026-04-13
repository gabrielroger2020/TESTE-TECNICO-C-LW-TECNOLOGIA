import z from "zod";

export const loginSchema = z.strictObject({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});