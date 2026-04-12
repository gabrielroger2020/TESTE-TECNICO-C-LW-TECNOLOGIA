import { queryAsync } from '../database/db';
import { DebitoComVeiculo, ItemRelatorioInadimplencia, RelatorioInadimplencia } from '../types';
import { calcularTotais } from './debito.service';

export async function relatorioInadimplencia(): Promise<RelatorioInadimplencia> {

  const debitos = await queryAsync<DebitoComVeiculo>(
    "SELECT d.*, v.placa, v.proprietario, v.modelo FROM debitos d INNER JOIN veiculos v ON v.id = d.veiculo_id WHERE d.status = ? ORDER BY v.placa ASC", ['VENCIDO']
  );

  const mapa = new Map<string, ItemRelatorioInadimplencia>();

  debitos.forEach((deb)=>{
    const valorTotalDebito = calcularTotais(deb).valor_total;
    const atual = mapa.get(deb.placa) ?? {
        placa: deb.placa,
        proprietario: deb.proprietario,
        modelo: deb.modelo,
        totalDebitosVencidos: 0,
        valorTotalVencido: 0
    };

    atual.totalDebitosVencidos += 1;
    atual.valorTotalVencido = Number((atual.valorTotalVencido + valorTotalDebito).toFixed(2));

    mapa.set(deb.placa, atual);
  })

  const veiculos = Array.from(mapa.values()).sort(
    (a,b) => b.valorTotalVencido - a.valorTotalVencido
  );

  const valorTotalGeral = Number((veiculos.reduce((acumulador, veiculoAtual) => acumulador + veiculoAtual.valorTotalVencido, 0)).toFixed(2));

  return {
    veiculos,
    totalVeiculos: veiculos.length,
    valorTotalGeral
  };
}
