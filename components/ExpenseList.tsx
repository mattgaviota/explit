'use client';

import { Trash2, Receipt } from 'lucide-react';
import { Expense, Participant } from '@/lib/types';

interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  onDeleteExpense: (id: string) => void;
  isLoading?: boolean;
}

export default function ExpenseList({
  expenses,
  participants,
  onDeleteExpense,
  isLoading = false,
}: ExpenseListProps) {
  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name || 'Alguien';

  const getParticipantColor = (id: string) =>
    participants.find((p) => p.id === id)?.color || '#ccc';

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <p className="font-medium">Aún no hay gastos registrados</p>
          <p className="text-sm">Presiona el botón para añadir el primero.</p>
        </div>
      ) : (
        expenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner"
                style={{
                  backgroundColor: getParticipantColor(exp.paidBy) + '20',
                  color: getParticipantColor(exp.paidBy),
                }}
              >
                {getParticipantName(exp.paidBy).charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{exp.description}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  Pagado por <span className="font-semibold text-slate-600">
                    {getParticipantName(exp.paidBy)}
                  </span>{' '}
                  • {exp.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">${exp.amount.toLocaleString()}</span>
              <button
                onClick={() => onDeleteExpense(exp.id)}
                disabled={isLoading}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
