import z from "zod";
import { placaFiltroSchema, placaValueSchema } from "./common.schema";

export const criarVeiculoSchema = z.strictObject({
  placa: placaValueSchema,
  renavam: z.string().length(11),
  proprietario: z.string().min(3),
  modelo: z.string().min(2),
  ano: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  cor: z.string().min(2),
});

export const paginacaoSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const filtroVeiculosSchema = z.strictObject({
  placa: placaFiltroSchema.optional(),
  proprietario: z.string().optional(),
  modelo: z.string().optional(),
  anoMin: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  anoMax: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional()
});

export const listarVeiculosQuerySchema = paginacaoSchema.merge(filtroVeiculosSchema).refine((data)=> data.anoMin === undefined || data.anoMax === undefined || data.anoMin <= data.anoMax,
  {
    message: 'anoMin não pode ser maior que anoMax',
    path: ['anoMin']
  }
);