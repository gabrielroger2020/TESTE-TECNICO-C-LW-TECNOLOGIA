import z from "zod";

export const criarDebitoSchema = z.strictObject({
  veiculo_id: z.number().int().positive(),
  tipo: z.enum(['IPVA', 'MULTA', 'LICENCIAMENTO', 'DPVAT']),
  descricao: z.string().min(3),
  valor: z.number().positive(),
  multa_percentual: z.number().min(0).default(0),
  juros_percentual: z.number().min(0).default(0),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']).default('PENDENTE'),
});

export const listarDebitosQuerySchema = z.strictObject({
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']).optional(),
  tipo: z.enum(['IPVA','MULTA','LICENCIAMENTO','DPVAT']).optional()
});

export const statusDebitoSchema = z.strictObject({ status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO'])});