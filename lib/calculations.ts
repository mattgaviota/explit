import { Participant, Expense, Settlement, Balances } from './types';

export function calculateTotalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export function calculatePerPersonAmount(
  totalAmount: number,
  participantCount: number
): number {
  return participantCount > 0 ? totalAmount / participantCount : 0;
}

export function calculateBalances(
  participants: Participant[],
  expenses: Expense[]
): Balances {
  const balances: Balances = {};

  // Initialize all participants with 0 balance
  participants.forEach((p) => {
    balances[p.id] = 0;
  });

  // Each person paid some amount
  expenses.forEach((exp) => {
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += exp.amount;
    }
  });

  // Each person owes the split average
  const totalAmount = calculateTotalAmount(expenses);
  const perPersonAmount = calculatePerPersonAmount(totalAmount, participants.length);

  participants.forEach((p) => {
    balances[p.id] -= perPersonAmount;
  });

  return balances;
}

export function calculateSettlements(
  participants: Participant[],
  balances: Balances
): Settlement[] {
  if (participants.length < 2) return [];

  const debtors: Array<{ id: string; amount: number }> = [];
  const creditors: Array<{ id: string; amount: number }> = [];

  Object.entries(balances).forEach(([id, balance]) => {
    if (balance > 0.01) creditors.push({ id, amount: balance });
    else if (balance < -0.01) debtors.push({ id, amount: Math.abs(balance) });
  });

  const results: Settlement[] = [];
  let i = 0,
    j = 0;

  // Greedy approach to clear debts
  const d = [...debtors];
  const c = [...creditors];

  while (i < d.length && j < c.length) {
    const payment = Math.min(d[i].amount, c[j].amount);
    results.push({
      from: d[i].id,
      to: c[j].id,
      amount: payment,
    });

    d[i].amount -= payment;
    c[j].amount -= payment;

    if (d[i].amount < 0.01) i++;
    if (c[j].amount < 0.01) j++;
  }

  return results;
}
