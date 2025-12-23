'use client';

import { CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Settlement as SettlementType, Participant } from '@/lib/types';

interface SettlementProps {
  settlements: SettlementType[];
  participants: Participant[];
}

export default function Settlement({ settlements, participants }: SettlementProps) {
  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name || 'Alguien';

  if (settlements.length === 0) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" /> ¿Quién le debe a quién?
        </h2>
        <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase">
          Cálculo Optimizado
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {settlements.map((s, idx) => (
          <div
            key={idx}
            className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between shadow-sm border border-white"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">{getParticipantName(s.from)}</span>
              <div className="flex items-center gap-1 text-emerald-600">
                <div className="h-px w-8 bg-emerald-200" />
                <ArrowRightLeft className="w-4 h-4" />
                <div className="h-px w-8 bg-emerald-200" />
              </div>
              <span className="font-bold text-slate-700">{getParticipantName(s.to)}</span>
            </div>
            <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-sm">
              Debe pagar ${s.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-emerald-700 text-xs italic">
        Este plan minimiza la cantidad total de transferencias necesarias.
      </p>
    </div>
  );
}
