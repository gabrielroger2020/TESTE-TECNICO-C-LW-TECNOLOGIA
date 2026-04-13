export function validarPlaca(placa: string): boolean {
  const regex = /^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/;
  return regex.test(placa);
}