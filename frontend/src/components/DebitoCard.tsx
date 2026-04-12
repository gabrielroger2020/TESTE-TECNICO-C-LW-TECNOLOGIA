'use client'

import api, { API_PREFIX, DebitoCalculado, isErroComResponse, QuitarDebitoResponse } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  debito: DebitoCalculado;
  onQuitar?: (debitoAtualizado: DebitoCalculado) => void
}

const LABELS_TIPO: Record<string, string> = {
  IPVA: 'IPVA',
  MULTA: 'Multa',
  LICENCIAMENTO: 'Licenciamento',
  DPVAT: 'DPVAT',
};

const CORES_STATUS: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PAGO: 'bg-green-100 text-green-800',
  VENCIDO: 'bg-red-100 text-red-800',
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function DebitoCard({ debito, onQuitar }: Props){

    const [quitando, setQuitando] = useState(false);

    async function handleQuitar() {
        if(quitando || debito.status === 'PAGO'){
            return;
        }

        setQuitando(true);

        try{
            const { data } = await api.patch<QuitarDebitoResponse>(`${API_PREFIX}/debitos/${debito.id}/quitar`);

            if(onQuitar){
                onQuitar(data.debito);
            }

            toast.success(data.mensagem || 'Débito quitado com sucesso');

        }catch (err : unknown){

            if (isErroComResponse(err)) {
                const status = err.response?.status;
                const mensagem = err.response?.data?.erro;

                if (status === 409) {
                toast.error(mensagem || 'Esse débito já foi pago');
                return;
                }

                if (status === 404) {
                toast.error(mensagem || 'Débito não encontrado');
                return;
                }
            }

            toast.error('Erro ao quitar débito');

        }finally{
            setQuitando(false);
        }

    }

    return(<div
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
            <div className="flex items-start justify-between">
            <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-700">
                {LABELS_TIPO[debito.tipo] || debito.tipo}
            </span>
            <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${CORES_STATUS[debito.status]}`}
            >
                {debito.status}
            </span>
            </div>
            <p className="text-sm text-gray-600">{debito.descricao}</p>
            <p className="text-xs text-gray-400 mt-1">
            Vencimento: {formatarData(debito.vencimento)}
            </p>
            </div>
            <div className="text-right ml-4">
            <p className="text-base font-bold text-gray-900">
            {formatarMoeda(debito.valor)}
            </p>
            {debito.valor_multa > 0 && (
            <p className="text-xs text-red-500">
                + {formatarMoeda(debito.valor_multa)} multa
            </p>
            )}
            {debito.valor_juros > 0 && (
            <p className="text-xs text-orange-500">
                + {formatarMoeda(debito.valor_juros)} juros
            </p>
            )}
            </div>
            </div>
            {debito.status !== 'PAGO' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-end">
                    <button
                    onClick={handleQuitar}
                    disabled={quitando}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {quitando ? 'Quitando...' : 'Quitar'}
                    </button>
                </div>
            )}
        </div>
    )
}