'use client';

import { X, TrendingUp } from 'lucide-react';
import { Participant, Balances } from '@/lib/types';

interface ParticipantsListProps {
  participants: Participant[];
  balances: Balances;
  onRemoveParticipant: (id: string) => void;
}

export default function ParticipantsList({
  participants,
  balances,
  onRemoveParticipant,
}: ParticipantsListProps) {
  return (
    <section className="md:col-span-4 space-y-6">
      {/* Participants Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span> Participantes ({participants.length})
        </h2>

        <div className="space-y-3">
          {participants.length === 0 && (
            <p className="text-center text-slate-400 py-4 text-sm italic">
              Agrega personas para empezar
            </p>
          )}
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{p.name}</span>
              </div>
              <button
                onClick={() => onRemoveParticipant(p.id)}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Balances Card */}
      {participants.length > 0 && (
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
      )}
    </section>
  );
}
