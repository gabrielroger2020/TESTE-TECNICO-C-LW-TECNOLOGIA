import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');

      toast.error("Acesso não autorizado");

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Tipos espelhando o backend
export interface Veiculo {
  id: number;
  placa: string;
  renavam: string;
  proprietario: string;
  modelo: string;
  ano: number;
  cor: string;
  criado_em: string;
}

export interface DebitoCalculado {
  id: number;
  veiculo_id: number;
  tipo: 'IPVA' | 'MULTA' | 'LICENCIAMENTO' | 'DPVAT';
  descricao: string;
  valor: number;
  multa_percentual: number;
  juros_percentual: number;
  valor_multa: number;
  valor_juros: number;
  valor_total: number;
  vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
  criado_em: string;
}

export interface RespostaPaginada<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QuitarDebitoResponse {
  mensagem?: string;
  debito: DebitoCalculado;
};

export interface ErroComResponse{
  response?: {
    status?: number;
    data?: {
      erro?: string;
    };
  };
};

export function isErroComResponse(err: unknown): err is ErroComResponse {
  return typeof err === 'object' && err !== null && 'response' in err;
}
