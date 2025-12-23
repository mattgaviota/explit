'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface ParticipantFormProps {
  onAddParticipant: (name: string) => void;
  disabled?: boolean;
}

export default function ParticipantForm({
  onAddParticipant,
  disabled = false,
}: ParticipantFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddParticipant(name.trim());
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Nombre..."
        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="w-5 h-5" />
      </button>
    </form>
  );
}
