import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore';
import { Expense, Session } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_NAME || '(default)'
);

// Collection references
export const sessionsCollection = collection(db, 'sessions') as CollectionReference<Session>;

export const getSessionRef = (sessionId: string): DocumentReference<Session> => {
  return doc(db, 'sessions', sessionId) as DocumentReference<Session>;
};

export const getExpensesCollection = (sessionId: string): CollectionReference<Expense> => {
  return collection(db, 'sessions', sessionId, 'expenses') as CollectionReference<Expense>;
};

export const getExpenseRef = (sessionId: string, expenseId: string): DocumentReference<Expense> => {
  return doc(db, 'sessions', sessionId, 'expenses', expenseId) as DocumentReference<Expense>;
};
