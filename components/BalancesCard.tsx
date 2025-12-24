'use client';

import { TrendingUp } from 'lucide-react';
import { Participant, Balances } from '@/lib/types';

interface BalancesCardProps {
  participants: Participant[];
  balances: Balances;
}

export default function BalancesCard({ participants, balances }: BalancesCardProps) {
  if (participants.length === 0) return null;

  return (
    <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-300" /> Balances
      </h2>
      <div className="space-y-4">
        {participants.map((p) => {
          const balance = balances[p.id] || 0;
          return (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <span className="opacity-80">{p.name}</span>
              <span
                className={`font-mono font-bold ${
                  balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
