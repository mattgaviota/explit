'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface FeedbackFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function FeedbackForm({ onSuccess, onError }: FeedbackFormProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error('Formspree request failed');
      }

      setMessage('');
      onSuccess();
    } catch (error) {
      console.error('Error sending feedback:', error);
      onError('No se pudo enviar la sugerencia. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          Sugerí una mejora
        </label>
        <textarea
          required
          rows={4}
          placeholder="¿Qué te gustaría que agreguemos o mejoremos?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-50 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? 'Enviando...' : 'Enviar Sugerencia'} <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
