'use client';

import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getSessionRef, getExpensesCollection } from './firebase';
import { Expense, Participant, Session } from './types';

const normalizeParticipant = (p: any): Participant => {
  const { caresFor, ...rest } = p;
  if (caresFor === undefined) return rest as Participant;
  return {
    ...rest,
    caresFor: Array.isArray(caresFor) ? caresFor : [caresFor],
  } as Participant;
};

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      getSessionRef(sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSession({
            ...data,
            id: docSnap.id,
            participants: (data.participants || []).map(normalizeParticipant),
          } as Session);
          setError(null);
        } else {
          setError('Session not found');
          setSession(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return { session, loading, error };
}

export function useExpenses(sessionId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      getExpensesCollection(sessionId),
      (snapshot) => {
        const expensesList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as Expense));

        // Sort by creation date (newest first)
        expensesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setExpenses(expensesList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return { expenses, loading, error };
}

export function useParticipants(sessionId: string) {
  const { session, loading, error } = useSession(sessionId);

  return {
    participants: session?.participants || [],
    loading,
    error,
  };
}
