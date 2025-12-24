'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { PlusCircle, Receipt, Wallet, Home, Copy, Check } from 'lucide-react';
import { useSession, useExpenses } from '@/lib/hooks';
import {
  calculateTotalAmount,
  calculatePerPersonAmount,
  calculateBalances,
  calculateSettlements,
} from '@/lib/calculations';
import { getExpensesCollection, getSessionRef, getExpenseRef } from '@/lib/firebase';
import { Participant } from '@/lib/types';
import ParticipantForm from './ParticipantForm';
import ParticipantsList from './ParticipantsList';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Settlement from './Settlement';
import Toast, { ToastMessage } from './Toast';

interface AppProps {
  sessionId: string;
}

export default function App({ sessionId }: AppProps) {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { expenses, loading: expensesLoading } = useExpenses(sessionId);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const addToast = (type: 'error' | 'success' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copySessionId = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/gastos/${sessionId}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSessionId(true);
        setTimeout(() => setCopiedSessionId(false), 2000);
      });
    }
  };

  const handleChangeSessionStatus = async (newStatus: 'draft' | 'payment-enabled' | 'completed') => {
    if (!sessionId || !session) return;

    const hasPayments = (session.completedPayments?.length || 0) > 0;

    // Validations
    if (newStatus === 'draft' && hasPayments) {
      addToast('error', 'No se puede volver a modo edición si hay pagos registrados');
      return;
    }

    try {
      await setDoc(getSessionRef(sessionId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const messages = {
        draft: 'Sesión en modo edición',
        'payment-enabled': 'Pagos habilitados',
        completed: 'Sesión completada',
      };

      addToast('success', messages[newStatus]);
    } catch (error) {
      console.error('Error changing session status:', error);
      addToast('error', 'Error al cambiar el estado de la sesión');
    }
  };

  const participants = session?.participants || [];
  const currentStatus = session?.status || 'draft';

  // Calculations
  const totalAmount = useMemo(
    () => calculateTotalAmount(expenses),
    [expenses]
  );

  const perPersonAmount = useMemo(
    () => calculatePerPersonAmount(totalAmount, participants.length),
    [totalAmount, participants.length]
  );

  const balances = useMemo(
    () => calculateBalances(participants, expenses),
    [participants, expenses]
  );

  const settlements = useMemo(
    () => calculateSettlements(participants, balances, session?.completedPayments),
    [participants, balances, session?.completedPayments]
  );

  // Handlers
  const handleAddParticipant = async (name: string) => {
    if (!sessionId || !session) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden agregar participantes en modo edición');
      return;
    }

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };

    try {
      await setDoc(getSessionRef(sessionId), {
        participants: arrayUnion(newParticipant),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleRemoveParticipant = async (id: string) => {
    if (!sessionId || !session) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden eliminar participantes en modo edición');
      return;
    }

    const participantToRemove = participants.find((p) => p.id === id);
    if (!participantToRemove) return;

    // Check if participant has made any payments
    const hasCompletedPayments = session.completedPayments?.some(
      (p) => p.from === id || p.to === id
    );

    if (hasCompletedPayments) {
      addToast('error', 'No se puede eliminar participante que ha realizado pagos');
      return;
    }

    try {
      // If removing a caregiver, free those being cared for
      let updatedParticipants = participants.filter((p) => p.id !== id);
      if (participantToRemove.caresFor) {
        updatedParticipants = updatedParticipants.map((p) => {
          if (p.caresFor === id) {
            const { caresFor, ...rest } = p;
            return rest;
          }
          return p;
        });
      }

      // Remove participant
      await setDoc(getSessionRef(sessionId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Remove all expenses from this participant
      const expensesToRemove = expenses.filter((e) => e.paidBy === id);
      for (const expense of expensesToRemove) {
        await deleteDoc(getExpenseRef(sessionId, expense.id));
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleAddExpense = async (
    description: string,
    amount: number,
    paidBy: string
  ) => {
    if (!sessionId) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden agregar gastos en modo edición');
      return;
    }

    try {
      await addDoc(getExpensesCollection(sessionId), {
        description,
        amount,
        paidBy,
        date: new Date().toLocaleDateString(),
      } as any);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!sessionId) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden eliminar gastos en modo edición');
      return;
    }

    try {
      await deleteDoc(getExpenseRef(sessionId, id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleUpdateSessionName = async (newName: string) => {
    if (!sessionId) return;

    const trimmedName = newName.trim();

    // Validate that name is not empty
    if (!trimmedName) {
      addToast('error', 'El nombre de la sesión no puede estar vacío');
      setIsEditingName(false);
      return;
    }

    try {
      await setDoc(getSessionRef(sessionId), {
        name: trimmedName,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating session name:', error);
    }
  };

  const handleAssignCare = async (caregiverId: string, careRecipientId: string) => {
    if (!sessionId || !session) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden cambiar relaciones de cuidado en modo edición');
      return;
    }

    const caregiver = participants.find((p) => p.id === caregiverId);
    const careRecipient = participants.find((p) => p.id === careRecipientId);

    if (!caregiver || !careRecipient) return;

    // Validation: caregiver can't already care for someone else
    if (caregiver.caresFor) {
      console.error('Caregiver already cares for someone');
      return;
    }

    // Validation: care recipient can't already be cared for
    const isCaredFor = participants.some((p) => p.caresFor === careRecipientId);
    if (isCaredFor) {
      console.error('Care recipient is already cared for');
      return;
    }

    try {
      const updatedParticipants = participants.map((p) =>
        p.id === caregiverId ? { ...p, caresFor: careRecipientId } : p
      );

      await setDoc(getSessionRef(sessionId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error assigning care:', error);
    }
  };

  const handleRemoveCare = async (caregiverId: string) => {
    if (!sessionId || !session) return;

    if (currentStatus !== 'draft') {
      addToast('error', 'Solo se pueden cambiar relaciones de cuidado en modo edición');
      return;
    }

    try {
      const updatedParticipants = participants.map((p) => {
        if (p.id === caregiverId) {
          const { caresFor, ...rest } = p;
          return rest;
        }
        return p;
      });

      await setDoc(getSessionRef(sessionId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error removing care:', error);
    }
  };

  const handlePaymentMade = async (from: string, to: string, amount: number) => {
    if (!sessionId || !session) return;

    if (currentStatus !== 'payment-enabled') {
      addToast('error', 'Los pagos solo se pueden registrar cuando están habilitados');
      return;
    }

    try {
      const completedPayments = [...(session.completedPayments || [])];
      completedPayments.push({
        from,
        to,
        amount,
        paidAt: new Date(),
      });

      await setDoc(getSessionRef(sessionId), {
        completedPayments,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error marking payment as made:', error);
    }
  };

  // Update document title when session name changes
  useEffect(() => {
    const displayName = session?.name || 'Sin nombre';
    document.title = `${displayName} - Explit`;
  }, [session?.name]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Sesión no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                  title="Volver al inicio"
                >
                  <Home className="w-6 h-6" />
                </button>
                <Wallet className="w-8 h-8" /> Explit
              </h1>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                currentStatus === 'draft' ? 'bg-slate-100 text-slate-700' :
                currentStatus === 'payment-enabled' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {currentStatus === 'draft' ? 'Edición' :
                 currentStatus === 'payment-enabled' ? 'Pagos' :
                 'Completada'}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleUpdateSessionName(editingName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateSessionName(editingName);
                    } else if (e.key === 'Escape') {
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <button
                  onClick={() => {
                    setEditingName(session?.name || '');
                    setIsEditingName(true);
                  }}
                  className="text-sm text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {session?.name || 'Sin nombre'}
                </button>
              )}
            </div>
            <p className="text-slate-500 mt-1">
              Divide gastos sin complicaciones en tus juntadas.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-500">
                Comparte esta sesión con tus amigos para que todos contribuyan:
              </p>
              <button
                onClick={copySessionId}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Copiar enlace de sesión"
              >
                {copiedSessionId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ID copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-mono text-slate-600">{sessionId.slice(0, 8)}...</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex gap-6 items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Gastado
                </p>
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Por persona
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${perPersonAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Status Change Button */}
            {currentStatus === 'draft' && (
              <button
                onClick={() => handleChangeSessionStatus('payment-enabled')}
                disabled={participants.length < 2 || expenses.length === 0}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  participants.length < 2 || expenses.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
                title={
                  participants.length < 2
                    ? 'Necesitas al menos 2 participantes'
                    : expenses.length === 0
                    ? 'Necesitas al menos 1 gasto registrado'
                    : undefined
                }
              >
                Habilitar Pagos
              </button>
            )}

            {currentStatus === 'payment-enabled' && (
              <div className="space-y-2">
                {(session?.completedPayments?.length || 0) === 0 && (
                  <button
                    onClick={() => handleChangeSessionStatus('draft')}
                    className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Volver a Editar
                  </button>
                )}

                {(session?.completedPayments?.length || 0) > 0 && (
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1 py-2">
                    🔒 No se puede volver (hay pagos registrados)
                  </div>
                )}

                {settlements.length > 0 && settlements.every((s) => s.paid) && (
                  <button
                    onClick={() => handleChangeSessionStatus('completed')}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Marcar Completada
                  </button>
                )}
              </div>
            )}

            {currentStatus === 'completed' && (
              <p className="text-xs text-slate-500 text-center py-2">✓ Sesión finalizada</p>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <ParticipantsList
            participants={participants}
            balances={balances}
            onRemoveParticipant={handleRemoveParticipant}
            onAssignCare={handleAssignCare}
            onRemoveCare={handleRemoveCare}
          />

          {/* Main Content */}
          <main className="md:col-span-8 space-y-8">
            {/* Add Participant */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4">Agregar Participante</h2>
              <ParticipantForm
                onAddParticipant={handleAddParticipant}
              />
            </div>

            {/* Expenses Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-indigo-500" /> Gastos de la Juntada
                </h2>
                <button
                  onClick={() => {
                    if (currentStatus !== 'draft') {
                      addToast('error', 'Solo se pueden agregar gastos en modo edición');
                      return;
                    }
                    setIsAddingExpense(true);
                  }}
                  disabled={participants.length === 0 || currentStatus !== 'draft'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg ${
                    participants.length === 0 || currentStatus !== 'draft'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200'
                  }`}
                >
                  <PlusCircle className="w-5 h-5" /> Registrar Gasto
                </button>
              </div>

              <ExpenseList
                expenses={expenses}
                participants={participants}
                onDeleteExpense={handleDeleteExpense}
                isLoading={expensesLoading}
              />
            </div>

            {/* Settlement */}
            <Settlement
              settlements={settlements}
              participants={participants}
              onPaymentMade={handlePaymentMade}
              sessionStatus={currentStatus as 'draft' | 'payment-enabled' | 'completed'}
            />
          </main>
        </div>

        {/* Modals */}
        <ExpenseForm
          isOpen={isAddingExpense}
          onClose={() => setIsAddingExpense(false)}
          onSubmit={handleAddExpense}
          participants={participants}
        />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto mt-12 mb-8 text-center text-slate-400 text-sm">
          Hecho para dividir gastos de forma justa y sin drama.
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
