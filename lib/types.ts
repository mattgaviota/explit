export interface Participant {
  id: string;
  name: string;
  color: string;
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
  participants: Participant[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Balances {
  [participantId: string]: number;
}
