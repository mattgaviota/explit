'use client';

import { CheckCircle2, Lock } from 'lucide-react';

interface SessionStatusBarProps {
  status: 'draft' | 'payment-enabled' | 'completed';
  hasCompletedPayments: boolean;
  allParticipantsPaid: boolean;
  onStatusChange: (newStatus: 'draft' | 'payment-enabled' | 'completed') => void;
}

export default function SessionStatusBar({
  status,
  hasCompletedPayments,
  allParticipantsPaid,
  onStatusChange,
}: SessionStatusBarProps) {
  const statusConfig = {
    draft: {
      label: 'Modo Edición',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      description: 'Agrega participantes y gastos',
    },
    'payment-enabled': {
      label: 'Pagos Habilitados',
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      description: 'Marca los pagos realizados',
    },
    completed: {
      label: 'Completada',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      description: 'Sesión finalizada',
    },
  };

  const currentConfig = statusConfig[status];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full border font-semibold text-sm ${currentConfig.color}`}>
            {currentConfig.label}
          </div>
          <p className="text-sm text-slate-500">{currentConfig.description}</p>
        </div>

        {status === 'completed' && (
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Finalizada</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {status === 'draft' && (
          <button
            onClick={() => onStatusChange('payment-enabled')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Habilitar Pagos
          </button>
        )}

        {status === 'payment-enabled' && (
          <>
            {!hasCompletedPayments && (
              <button
                onClick={() => onStatusChange('draft')}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Volver a Editar
              </button>
            )}

            {hasCompletedPayments && (
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                No se puede volver a editar (hay pagos registrados)
              </div>
            )}

            {allParticipantsPaid && (
              <button
                onClick={() => onStatusChange('completed')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Marcar Completada
              </button>
            )}
          </>
        )}

        {status === 'completed' && (
          <p className="text-sm text-slate-500">La sesión está finalizada y en modo solo lectura</p>
        )}
      </div>
    </div>
  );
}
