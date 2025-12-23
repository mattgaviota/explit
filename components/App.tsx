'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { PlusCircle, Receipt, Wallet } from 'lucide-react';
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

interface AppProps {
  sessionId: string;
}

export default function App({ sessionId }: AppProps) {
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { expenses, loading: expensesLoading } = useExpenses(sessionId);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');

  const participants = session?.participants || [];

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
    () => calculateSettlements(participants, balances),
    [participants, balances]
  );

  // Handlers
  const handleAddParticipant = async (name: string) => {
    if (!sessionId || !session) return;

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

    const participantToRemove = participants.find((p) => p.id === id);
    if (!participantToRemove) return;

    try {
      // Remove participant
      await setDoc(getSessionRef(sessionId), {
        participants: arrayRemove(participantToRemove),
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

    try {
      await deleteDoc(getExpenseRef(sessionId, id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleUpdateSessionName = async (newName: string) => {
    if (!sessionId) return;

    try {
      await setDoc(getSessionRef(sessionId), {
        name: newName.trim() || undefined,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating session name:', error);
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
            <h1 className="text-3xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
              <Wallet className="w-8 h-8" /> Explit
            </h1>
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
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-6 items-center">
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
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <ParticipantsList
            participants={participants}
            balances={balances}
            onRemoveParticipant={handleRemoveParticipant}
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
                  onClick={() => setIsAddingExpense(true)}
                  disabled={participants.length === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg ${
                    participants.length === 0
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
            <Settlement settlements={settlements} participants={participants} />
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
    </div>
  );
}
