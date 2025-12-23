'use client';

import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Participant } from '@/lib/types';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, amount: number, paidBy: string) => void;
  participants: Participant[];
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  participants,
}: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) return;

    setIsLoading(true);
    try {
      await onSubmit(description, parseFloat(amount), paidBy);
      setDescription('');
      setAmount('');
      setPaidBy('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">Registrar Gasto</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 ml-1">Descripción</label>
            <input
              autoFocus
              required
              placeholder="Ej: Asado, Bebidas, Taxi..."
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">Monto ($)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">¿Quién pagó?</label>
              <select
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Seleccionar...</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Gasto'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
