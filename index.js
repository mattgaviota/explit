import React, { useState, useMemo } from 'react';
import {
    Users,
    PlusCircle,
    Receipt,
    Trash2,
    ChevronRight,
    Wallet,
    ArrowRightLeft,
    CheckCircle2,
    UserPlus,
    TrendingUp,
    X
} from 'lucide-react';

/**
 * App Component: Main container for the Expense Splitter logic.
 * Handles state for participants, expenses, and current view.
 */
export default function App() {
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [newParticipantName, setNewParticipantName] = useState('');
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
        paidBy: ''
    });

    // --- HANDLERS ---

    const addParticipant = (e) => {
        e.preventDefault();
        if (!newParticipantName.trim()) return;

        const newParticipant = {
            id: crypto.randomUUID(),
            name: newParticipantName.trim(),
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        setParticipants([...participants, newParticipant]);
        setNewParticipantName('');
    };

    const removeParticipant = (id) => {
        setParticipants(participants.filter(p => p.id !== id));
        setExpenses(expenses.filter(e => e.paidBy !== id));
    };

    const addExpense = (e) => {
        e.preventDefault();
        const { description, amount, paidBy } = expenseForm;
        if (!description || !amount || !paidBy) return;

        const newExpense = {
            id: crypto.randomUUID(),
            description,
            amount: parseFloat(amount),
            paidBy,
            date: new Date().toLocaleDateString()
        };

        setExpenses([newExpense, ...expenses]);
        setExpenseForm({ description: '', amount: '', paidBy: '' });
        setIsAddingExpense(false);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    // --- CALCULATIONS ---

    const totalAmount = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);

    const perPersonAmount = useMemo(() => {
        return participants.length > 0 ? totalAmount / participants.length : 0;
    }, [totalAmount, participants]);

    const balances = useMemo(() => {
        const b = {};
        participants.forEach(p => b[p.id] = 0);

        // Each person paid some amount
        expenses.forEach(exp => {
            if (b[exp.paidBy] !== undefined) {
                b[exp.paidBy] += exp.amount;
            }
        });

        // Each person owes the split average
        participants.forEach(p => {
            b[p.id] -= perPersonAmount;
        });

        return b;
    }, [participants, expenses, perPersonAmount]);

    /**
     * Settlement algorithm: Matches debtors with creditors.
     */
    const settlements = useMemo(() => {
        if (participants.length < 2) return [];

        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([id, balance]) => {
            if (balance > 0.01) creditors.push({ id, amount: balance });
            else if (balance < -0.01) debtors.push({ id, amount: Math.abs(balance) });
        });

        const results = [];
        let i = 0, j = 0;

        // Greedy approach to clear debts
        const d = [...debtors];
        const c = [...creditors];

        while (i < d.length && j < c.length) {
            const payment = Math.min(d[i].amount, c[j].amount);
            results.push({
                from: d[i].id,
                to: c[j].id,
                amount: payment
            });

            d[i].amount -= payment;
            c[j].amount -= payment;

            if (d[i].amount < 0.01) i++;
            if (c[j].amount < 0.01) j++;
        }

        return results;
    }, [balances, participants]);

    const getParticipantName = (id) => participants.find(p => p.id === id)?.name || 'Alguien';
    const getParticipantColor = (id) => participants.find(p => p.id === id)?.color || '#ccc';

    // --- RENDER ---

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                            <Wallet className="w-8 h-8" /> Cuentas Claras
                        </h1>
                        <p className="text-slate-500 mt-1">Divide gastos sin complicaciones en tus juntadas.</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-6 items-center">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gastado</p>
                            <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Por persona</p>
                            <p className="text-2xl font-bold text-indigo-600">${perPersonAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Sidebar: Participants */}
                    <section className="md:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" /> Participantes ({participants.length})
                            </h2>

                            <form onSubmit={addParticipant} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="Nombre..."
                                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={newParticipantName}
                                    onChange={(e) => setNewParticipantName(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </form>

                            <div className="space-y-3">
                                {participants.length === 0 && (
                                    <p className="text-center text-slate-400 py-4 text-sm italic">Agrega personas para empezar</p>
                                )}
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: p.color }}
                                            >
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeParticipant(p.id)}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Balances Summary */}
                        {participants.length > 0 && (
                            <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-300" /> Balances
                                </h2>
                                <div className="space-y-4">
                                    {participants.map(p => {
                                        const balance = balances[p.id] || 0;
                                        return (
                                            <div key={p.id} className="flex justify-between items-center text-sm">
                                                <span className="opacity-80">{p.name}</span>
                                                <span className={`font-mono font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Main Content: Expenses & Settlement */}
                    <main className="md:col-span-8 space-y-8">

                        {/* Action Bar */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Receipt className="w-6 h-6 text-indigo-500" /> Gastos de la Juntada
                            </h2>
                            <button
                                onClick={() => setIsAddingExpense(true)}
                                disabled={participants.length === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg ${participants.length === 0
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200'
                                    }`}
                            >
                                <PlusCircle className="w-5 h-5" /> Registrar Gasto
                            </button>
                        </div>

                        {/* Expense List */}
                        <div className="space-y-4">
                            {expenses.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium">Aún no hay gastos registrados</p>
                                    <p className="text-sm">Presiona el botón para añadir el primero.</p>
                                </div>
                            ) : (
                                expenses.map(exp => (
                                    <div key={exp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner"
                                                style={{ backgroundColor: getParticipantColor(exp.paidBy) + '20', color: getParticipantColor(exp.paidBy) }}
                                            >
                                                {getParticipantName(exp.paidBy).charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{exp.description}</h4>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    Pagado por <span className="font-semibold text-slate-600">{getParticipantName(exp.paidBy)}</span> • {exp.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold">${exp.amount.toLocaleString()}</span>
                                            <button
                                                onClick={() => deleteExpense(exp.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Settlement Section */}
                        {settlements.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" /> ¿Quién le debe a quién?
                                    </h2>
                                    <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase">Cálculo Optimizado</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {settlements.map((s, idx) => (
                                        <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between shadow-sm border border-white">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-700">{getParticipantName(s.from)}</span>
                                                <div className="flex items-center gap-1 text-emerald-600">
                                                    <div className="h-px w-8 bg-emerald-200" />
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                    <div className="h-px w-8 bg-emerald-200" />
                                                </div>
                                                <span className="font-bold text-slate-700">{getParticipantName(s.to)}</span>
                                            </div>
                                            <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-sm">
                                                Debe pagar ${s.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-center text-emerald-700 text-xs italic">
                                    Este plan minimiza la cantidad total de transferencias necesarias.
                                </p>
                            </div>
                        )}
                    </main>
                </div>

                {/* Floating Modal for Add Expense */}
                {isAddingExpense && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Registrar Gasto</h3>
                                <button onClick={() => setIsAddingExpense(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={addExpense} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-500 ml-1">Descripción</label>
                                    <input
                                        autoFocus
                                        required
                                        placeholder="Ej: Asado, Bebidas, Taxi..."
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        value={expenseForm.description}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-500 ml-1">Monto ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono font-bold"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-500 ml-1">¿Quién pagó?</label>
                                        <select
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                                            value={expenseForm.paidBy}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {participants.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                    >
                                        Guardar Gasto <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Info */}
            <footer className="max-w-4xl mx-auto mt-12 mb-8 text-center text-slate-400 text-sm">
                Hecho para dividir gastos de forma justa y sin drama.
            </footer>
        </div>
    );
}