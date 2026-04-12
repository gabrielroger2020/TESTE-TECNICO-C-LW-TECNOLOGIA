'use client';

import { DebitoCalculado } from '@/lib/api';
import DebitoCard from './DebitoCard';

interface Props {
  debitos: DebitoCalculado[];
  onQuitar?: (debitoAtualizado: DebitoCalculado) => void
}

export default function DebitosList({ debitos, onQuitar }: Props) {

  if (debitos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Nenhum débito encontrado para este veículo.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debitos.map((debito) => (
        <DebitoCard key={`card-debito-${debito.id}`} debito={debito} onQuitar={onQuitar}>
        </DebitoCard>
      ))}
    </div>
  );
}
