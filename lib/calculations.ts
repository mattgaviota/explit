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

  // Create map of who cares for whom
  const caredByMap: { [id: string]: string } = {};
  participants.forEach((p) => {
    if (p.caresFor) {
      p.caresFor.forEach((recipientId) => {
        caredByMap[recipientId] = p.id;
      });
    }
  });

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

  const totalAmount = calculateTotalAmount(expenses);
  const perPersonAmount = calculatePerPersonAmount(totalAmount, participants.length);

  participants.forEach((p) => {
    balances[p.id] -= perPersonAmount;
  });

  // Caregiver assumes each care recipient's debt (not their credit)
  participants.forEach((p) => {
    if (p.caresFor && p.caresFor.length > 0) {
      p.caresFor.forEach((recipientId) => {
        if (balances[recipientId] !== undefined && balances[recipientId] < 0) {
          balances[p.id] += balances[recipientId];
          balances[recipientId] = 0;
        }
      });
    }
  });

  return balances;
}

export function calculateSettlements(
  participants: Participant[],
  balances: Balances,
  completedPayments?: Array<{ from: string; to: string; amount: number }>
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
    const settlement: Settlement = {
      from: d[i].id,
      to: c[j].id,
      amount: payment,
    };

    // Mark as paid if it matches a completed payment
    if (completedPayments) {
      settlement.paid = completedPayments.some(
        (p) =>
          p.from === settlement.from &&
          p.to === settlement.to &&
          Math.abs(p.amount - settlement.amount) < 0.01
      );
    }

    results.push(settlement);

    d[i].amount -= payment;
    c[j].amount -= payment;

    if (d[i].amount < 0.01) i++;
    if (c[j].amount < 0.01) j++;
  }

  return results;
}
