/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';

export default function ExpenseForm({ categories, onAddExpense }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0] || 'Food');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Please provide an expense name.');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }

        onAddExpense(name.trim(), parsedAmount, category);
        setName('');
        setAmount('');
        setCategory(categories[0] || 'Food');
    };

    return (
        <section id="form-add-expense" className="overflow-x-hidden rounded-none border border-[#141414] bg-white p-3 sm:p-4 md:p-6 transition-all hover:shadow-[4px_4px_0px_0px_#141414]">
            <div className="mb-5 flex items-start gap-2.5 md:mb-6">
                <PlusCircle className="mt-0.5 h-5 w-5 text-[#F27D26]"/>
                <h2 className="font-serif text-xl italic font-semibold leading-tight text-[#141414] md:text-2xl xl:text-3xl">Record New Expense</h2>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-none border border-red-600 bg-red-50 p-3 font-mono text-[11px] font-semibold uppercase text-red-800" id="form-error-alert">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600"/>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12 md:gap-5 md:items-end">
                <div className="md:col-span-5">
                    <label className="mb-1.5 block px-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#141414]/60">
                        EXPENSE NAME / ARCHIVE IDENTIFIER
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error)
                                setError('');
                        }}
                        className="h-[42px] w-full rounded-none border border-[#141414] bg-[#EBEBE4] px-3.5 text-xs font-semibold text-[#141414] outline-none transition-all placeholder:text-[#141414]/40 focus:bg-white"
                        placeholder="e.g., VIVID GEOMETRY CATALOGUE"
                    />
                </div>

                <div className="sm:col-span-1 md:col-span-3">
                    <label className="mb-1.5 block px-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#141414]/60">
                        COST (INR)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-[#141414]/60">Rs</span>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                if (error)
                                    setError('');
                            }}
                            className="h-[42px] w-full rounded-none border border-[#141414] bg-[#EBEBE4] pl-10 pr-3.5 font-mono text-xs font-bold text-[#141414] outline-none focus:bg-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="sm:col-span-1 md:col-span-4">
                    <label className="mb-1.5 block px-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#141414]/60">
                        CATEGORY / CLASSIFICATION
                    </label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-[42px] w-full cursor-pointer appearance-none rounded-none border border-[#141414] bg-[#EBEBE4] pl-3.5 pr-10 text-xs font-bold uppercase tracking-wider text-[#141414] outline-none transition-all focus:bg-white"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#141414]">
                            <span className="text-[9px]">▼</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-12 flex justify-end">
                    <button
                        type="submit"
                        id="btn-submit-expense"
                        className="flex h-[42px] w-full items-center justify-center rounded-none border border-[#141414] bg-[#141414] px-6 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#F27D26] md:w-auto md:min-w-[200px]"
                    >
                        RECORD ENTRY +
                    </button>
                </div>
            </form>
        </section>
    );
}
