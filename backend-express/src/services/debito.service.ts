import { queryAsync, getAsync, runAsync } from '../database/db';
import { Debito, DebitoCalculado, Veiculo } from '../types';

export function calcularTotais(debito: Debito): DebitoCalculado {
  const valorMulta = debito.valor * (debito.multa_percentual / 100);

  const valorComMulta = debito.valor + valorMulta;
  const valorJuros = valorComMulta * (debito.juros_percentual / 100);

  return {
    ...debito,
    valor_multa: valorMulta,
    valor_juros: valorJuros,
    valor_total: valorComMulta + valorJuros,
  };
}

export async function buscarDebitosPorPlaca(placa: string): Promise<DebitoCalculado[]> {
  const veiculo = await getAsync<Veiculo>(
    'SELECT * FROM veiculos WHERE placa = ?',
    [placa.toUpperCase()]
  );

  if (!veiculo) {
    throw new Error('Veículo não encontrado');
  }

  const debitos = await queryAsync<Debito>(
    'SELECT * FROM debitos WHERE veiculo_id = ? ORDER BY vencimento ASC',
    [(veiculo as unknown as Veiculo).id]
  );

  return debitos.map(calcularTotais);
}

export async function buscarDebitoPorId(id: number): Promise<DebitoCalculado | undefined> {
  const debito = await getAsync<Debito>('SELECT * FROM debitos WHERE id = ?', [id]);
  if (!debito) return undefined;
  return calcularTotais(debito);
}

export async function criarDebito(dados: Omit<Debito, 'id' | 'criado_em'>): Promise<DebitoCalculado> {
  const { lastInsertRowid } = await runAsync(
    `INSERT INTO debitos (veiculo_id, tipo, descricao, valor, multa_percentual, juros_percentual, vencimento, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [dados.veiculo_id, dados.tipo, dados.descricao, dados.valor, dados.multa_percentual, dados.juros_percentual, dados.vencimento, dados.status]
  );

  const debito = await getAsync<Debito>('SELECT * FROM debitos WHERE id = ?', [lastInsertRowid]);
  if (!debito) throw new Error('Erro ao criar débito');
  return calcularTotais(debito);
}

export async function atualizarStatusDebito(id: number, status: Debito['status']): Promise<void> {
  const { changes } = await runAsync(
    'UPDATE debitos SET status = ? WHERE id = ?',
    [status, id]
  );
  if (changes === 0) throw new Error('Débito não encontrado');
}
