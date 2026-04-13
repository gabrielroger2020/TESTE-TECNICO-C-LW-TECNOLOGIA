import z from "zod";
import { validarPlaca } from "../utils/placa";

export const idSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export const placaValueSchema = z.string().refine(validarPlaca, {
  message: 'Formato de placa inválido',
});

export const placaSchema = z.strictObject({
  placa: placaValueSchema
})

export const placaFiltroSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(1)
  .max(8);