import { queryAsync, getAsync, runAsync } from '../database/db';
import { Veiculo, RespostaPaginada, ListarVeiculosFiltros, PaginacaoParams } from '../types';

export function validarPlaca(placa: string): boolean {
  // Formato antigo: ABC1234 | Formato Mercosul: ABC1D23
  const regex = /^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/;
  return regex.test(placa);
}

export async function listarVeiculos(
  paginacao: PaginacaoParams,
  filtros: ListarVeiculosFiltros = {}
): Promise<RespostaPaginada<Veiculo>> {
  const offset = (paginacao.page - 1) * paginacao.limit;

  const parametros: unknown[] = [];
  const where: string[] = [];

  if (filtros.proprietario?.trim()) {
    where.push('proprietario LIKE ? COLLATE NOCASE');
    parametros.push(`%${filtros.proprietario.trim()}%`);
  }

  if (filtros.modelo?.trim()) {
    where.push('modelo LIKE ? COLLATE NOCASE');
    parametros.push(`%${filtros.modelo.trim()}%`);
  }

  if (filtros.anoMin !== undefined) {
    where.push('ano >= ?');
    parametros.push(filtros.anoMin);
  }

  if (filtros.anoMax !== undefined) {
    where.push('ano <= ?');
    parametros.push(filtros.anoMax);
  }

  if (filtros.placa?.trim()) {
    where.push('placa = ?');
    parametros.push(filtros.placa.trim().toUpperCase());
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sqlLista = `SELECT * FROM veiculos ${whereSql} ORDER BY criado_em DESC LIMIT ? OFFSET ?`;
  const sqlTotal = `SELECT COUNT(*) as total FROM veiculos ${whereSql}`;

  const [veiculos, contagem] = await Promise.all([
    queryAsync<Veiculo>(sqlLista, [...parametros, paginacao.limit, offset]),
    queryAsync<{ total: number }>(sqlTotal, parametros),
  ]);

  return {
    data: veiculos,
    total: contagem[0]?.total ?? 0,
    page: paginacao.page,
    limit: paginacao.limit,
  };
}

export async function buscarPorPlaca(placa: string): Promise<Veiculo | undefined> {
  return getAsync<Veiculo>(
    'SELECT * FROM veiculos WHERE placa = ?',
    [placa.toUpperCase()]
  );
}

export async function criarVeiculo(dados: Omit<Veiculo, 'id' | 'criado_em'>): Promise<Veiculo> {
  const { lastInsertRowid } = await runAsync(
    'INSERT INTO veiculos (placa, renavam, proprietario, modelo, ano, cor) VALUES (?, ?, ?, ?, ?, ?)',
    [dados.placa.toUpperCase(), dados.renavam, dados.proprietario, dados.modelo, dados.ano, dados.cor]
  );

  const veiculo = await getAsync<Veiculo>('SELECT * FROM veiculos WHERE id = ?', [lastInsertRowid]);
  if (!veiculo) throw new Error('Erro ao criar veículo');
  return veiculo;
}
