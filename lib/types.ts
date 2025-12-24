export interface Participant {
  id: string;
  name: string;
  color: string;
  caresFor?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  createdAt?: Date;
}

export interface Session {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  expiredAt: Date;
  participants: Participant[];
  completedPayments?: Array<{
    from: string;
    to: string;
    amount: number;
    paidAt: Date;
  }>;
  status?: 'draft' | 'payment-enabled' | 'completed';
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  paid?: boolean;
}

export interface Balances {
  [participantId: string]: number;
}
