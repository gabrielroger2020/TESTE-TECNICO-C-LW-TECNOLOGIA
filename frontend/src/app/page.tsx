'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { API_PREFIX, Veiculo, RespostaPaginada } from '@/lib/api';
import { estaAutenticado } from '@/lib/auth';
import Header from '@/components/Header';
import VeiculoCard from '@/components/VeiculoCard';
import Paginacao from '@/components/Paginacao';

export default function HomePage() {
  const router = useRouter();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'placa' | 'proprietario' | 'modelo'>('placa');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const LIMITE = 5;

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }
    carregarVeiculos();

  }, [paginaAtual, busca, tipoFiltro]);

  async function carregarVeiculos() {
    setCarregando(true);
    try {

      const query = new URLSearchParams({
        page: String(paginaAtual),
        limit: String(LIMITE)
      });

      const termo = busca.trim();

      if (termo && termo != '') {
        query.set(tipoFiltro, termo);
      }

      const { data } = await api.get<RespostaPaginada<Veiculo>>(
        `${API_PREFIX}/veiculos?${query.toString()}`
      );
      setVeiculos(data.data);
      setTotalRegistros(data.total);
      setErro('');
    } catch(err) {
      setErro('Erro ao carregar veículos. Tente novamente.');
      setVeiculos([]);
      setTotalRegistros(0)
    } finally {
      setCarregando(false);
    }
  }

  const totalPaginas = Math.ceil(totalRegistros / LIMITE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Veículos</h2>
            <p className="text-sm text-gray-500 mt-0.5">{totalRegistros} veículos cadastrados</p>
          </div>
        </div>

        <div className="mb-4 flex gap-2">

          <select className='w-[20%] border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500' onChange={(e) => {
            setTipoFiltro(e.target.value as 'placa' | 'proprietario' | 'modelo');
            setPaginaAtual(1);
          }}>
            <option value={'placa'}>Placa</option>
            <option value={'proprietario'}>Proprietario</option>
            <option value={'modelo'}>Modelo</option>
          </select>

          <input
            type="text"
            value={busca}
            placeholder="Buscar por placa, proprietário ou modelo..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: LIMITE }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {veiculos.map((v) => (
                <VeiculoCard key={v.id} veiculo={v} />
              ))}
            </div>

            {veiculos.length === 0 && !carregando && (
              <p className="text-center text-gray-500 py-10">Nenhum veículo encontrado.</p>
            )}

            <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} onMudar={setPaginaAtual}>

            </Paginacao>
          </>
        )}
      </main>
    </div>
  );
}
