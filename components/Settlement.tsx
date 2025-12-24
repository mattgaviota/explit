'use client';

import { CheckCircle2, ArrowRightLeft, Check } from 'lucide-react';
import { Settlement as SettlementType, Participant } from '@/lib/types';

interface SettlementProps {
  settlements: SettlementType[];
  participants: Participant[];
  onPaymentMade?: (from: string, to: string, amount: number) => void;
  sessionStatus?: 'draft' | 'payment-enabled' | 'completed';
}

export default function Settlement({ settlements, participants, onPaymentMade, sessionStatus = 'draft' }: SettlementProps) {
  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name || 'Alguien';

  if (settlements.length === 0) return null;

  const pendingPayments = settlements.filter((s) => !s.paid);
  const completedPayments = settlements.filter((s) => s.paid);

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

      {sessionStatus === 'draft' && pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 Habilita los pagos en el estado de la sesión para registrar transacciones completadas
          </p>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-900">Pendiente</h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingPayments.map((s, idx) => (
              <div
                key={idx}
                className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700">{getParticipantName(s.from)}</span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <div className="h-px w-4 bg-emerald-200" />
                      <ArrowRightLeft className="w-3 h-3" />
                      <div className="h-px w-4 bg-emerald-200" />
                    </div>
                    <span className="font-bold text-slate-700">{getParticipantName(s.to)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-sm whitespace-nowrap">
                    Debe pagar ${s.amount.toFixed(2)}
                  </div>
                  {onPaymentMade && sessionStatus === 'payment-enabled' && (
                    <button
                      onClick={() => onPaymentMade(s.from, s.to, s.amount)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-900">Completado</h3>
          <div className="grid grid-cols-1 gap-4">
            {completedPayments.map((s, idx) => (
              <div
                key={idx}
                className="bg-emerald-100/40 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-emerald-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-600 line-through">{getParticipantName(s.from)}</span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <div className="h-px w-4 bg-emerald-200" />
                      <ArrowRightLeft className="w-3 h-3" />
                      <div className="h-px w-4 bg-emerald-200" />
                    </div>
                    <span className="font-bold text-slate-600 line-through">{getParticipantName(s.to)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-emerald-700">
                  <div className="font-bold text-sm">
                    Pagó ${s.amount.toFixed(2)}
                  </div>
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-emerald-700 text-xs italic">
        Este plan minimiza la cantidad total de transferencias necesarias.
      </p>
    </div>
  );
}
