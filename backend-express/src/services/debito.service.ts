import { queryAsync, getAsync, runAsync } from '../database/db';
import { Debito, DebitoCalculado, ResumoDebitos, ResumoDebitosPorTipo, Veiculo } from '../types';

export function calcularTotais(debito: Debito): DebitoCalculado {
  const valorMulta = debito.valor * (debito.multa_percentual / 100);

  const valorComMulta = debito.valor + valorMulta;
  const valorJuros = debito.valor * (debito.juros_percentual / 100);

  return {
    ...debito,
    valor_multa: valorMulta,
    valor_juros: valorJuros,
    valor_total: valorComMulta + valorJuros,
  };
}

export async function buscarDebitosPorPlaca(placa: string, status?: string, tipo?: string): Promise<DebitoCalculado[]> {
  const veiculo = await getAsync<Veiculo>(
    'SELECT * FROM veiculos WHERE placa = ?',
    [placa.toUpperCase()]
  );

  if (!veiculo) {
    throw new Error('Veículo não encontrado');
  }

  const parametros: unknown[] = [veiculo.id];
  const where: string[] = ['veiculo_id = ?']

  if(status){
    where.push('status = ?');
    parametros.push(status);
  }

  if(tipo){
    where.push('tipo = ?');
    parametros.push(tipo);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let sqlLista = `SELECT * FROM debitos ${whereSql} ORDER BY vencimento ASC`;

  const debitos = await queryAsync<Debito>(
    sqlLista,
    parametros
  );

  return debitos.map(calcularTotais);
}

export async function buscarDebitoPorId(id: number): Promise<DebitoCalculado | undefined> {
  const debito = await getAsync<Debito>('SELECT * FROM debitos WHERE id = ?', [id]);
  if (!debito) return undefined;
  return calcularTotais(debito);
}

export async function resumoPorPlaca(placa: string): Promise<ResumoDebitos>{

  const veiculo = await getAsync<Veiculo>(
    'SELECT * FROM veiculos WHERE placa = ?',
    [placa.toUpperCase()]
  );

  if (!veiculo) {
    throw new Error('Veículo não encontrado');
  }

  const debitos = await buscarDebitosPorPlaca(veiculo.placa);

  const valorTotalPorTipo:ResumoDebitosPorTipo = {};
  let valorTotal = 0;

  debitos.forEach((deb)=>{
    valorTotal += deb.valor_total;
    valorTotalPorTipo[deb.tipo] = Number(((valorTotalPorTipo[deb.tipo] ?? 0) + deb.valor_total).toFixed(2));
  });

  const resumo : ResumoDebitos = {
    placa: veiculo.placa,
    proprietario: veiculo.proprietario,
    totalDebitos: debitos.length,
    valorTotal: Number(valorTotal.toFixed(2)),
    porTipo: valorTotalPorTipo
  }

  return resumo;

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

export async function quitarDebito(id: number){

  const debito = await buscarDebitoPorId(id);

  if (!debito) {
    throw new Error('Débito não encontrado');
  }

  if(debito.status == 'PAGO'){
    throw new Error('Débito já foi pago');
  }

  await atualizarStatusDebito(id, 'PAGO');

  const debitoAtualizado = await buscarDebitoPorId(id);

  if(!debitoAtualizado){
    throw new Error('Erro ao quitar débito.');
  }

  return debitoAtualizado;
}

export async function atualizarStatusDebito(id: number, status: Debito['status']): Promise<void> {
  const { changes } = await runAsync(
    'UPDATE debitos SET status = ? WHERE id = ?',
    [status, id]
  );
  if (changes === 0) throw new Error('Débito não encontrado');
}
