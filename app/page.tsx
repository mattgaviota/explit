'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setDoc, serverTimestamp } from 'firebase/firestore';
import { Wallet, Copy, Check } from 'lucide-react';
import { getSessionRef } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);

      // Create session in Firestore
      const now = new Date();
      const expiredAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      await setDoc(
        getSessionRef(newSessionId),
        {
          name: sessionName.trim() || undefined,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiredAt: expiredAt,
          participants: [],
        },
        { merge: true }
      );

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/gastos/${newSessionId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error al crear la sesión');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSessionId.trim()) return;

    setIsJoining(true);
    router.push(`/gastos/${joinSessionId.trim()}`);
  };

  const copyToClipboard = () => {
    if (!sessionId) return;
    const url = `${window.location.origin}/gastos/${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-slate-900 font-sans p-4">
      <div className="max-w-2xl mx-auto space-y-12 py-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Wallet className="w-12 h-12 text-indigo-600" />
            <h1 className="text-5xl font-bold text-indigo-600">Explit</h1>
          </div>
          <p className="text-xl text-slate-600">
            Divide gastos sin complicaciones en tus juntadas
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Create Session */}
          {!sessionId ? (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-center">Crear Nueva Sesión</h2>

              <div className="space-y-4">
                <p className="text-slate-600 text-center">
                  Comienza una nueva juntada y comparte el link con tus amigos
                </p>

                <input
                  type="text"
                  placeholder="Nombre de la sesión (opcional)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-50"
                />

                <button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-lg transition-all shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creando sesión...' : 'Crear Sesión'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-3xl shadow-lg p-8 border border-emerald-200">
              <h2 className="text-2xl font-bold mb-6 text-center text-emerald-900">
                Sesión Creada
              </h2>

              <div className="space-y-4">
                <p className="text-slate-600 text-center mb-4">
                  Comparte este link con tus amigos:
                </p>

                <div className="bg-white rounded-2xl p-4 flex items-center justify-between gap-2">
                  <code className="text-sm text-slate-500 break-all">
                    {typeof window !== 'undefined' &&
                      `${window.location.origin}/gastos/${sessionId}`}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => router.push(`/gastos/${sessionId}`)}
                  className="w-full bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-emerald-700 transition-all shadow-emerald-200 shadow-lg"
                >
                  Ir a la Sesión
                </button>
              </div>
            </div>
          )}

          {/* Join Session */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-center">Unirse a una Sesión</h2>

            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Código de Sesión
                </label>
                <input
                  type="text"
                  placeholder="Pega el ID o URL compartida"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                  disabled={isJoining}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || !joinSessionId.trim()}
                className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Uniéndose...' : 'Unirse'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm">
          <p>Hecho para dividir gastos de forma justa y sin drama.</p>
        </footer>
      </div>
    </div>
  );
}
