/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import * as Lucide from 'lucide-react';
import { INITIAL_CATEGORIES } from '../mockData';

export function getCategoryIcon(iconName) {
    const IconComponent = Lucide[iconName];
    if (IconComponent) {
        return <IconComponent className="h-5 w-5"/>;
    }
    return <Lucide.HelpCircle className="h-5 w-5"/>;
}

export function formatDate(dateStr) {
    if (!dateStr)
        return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3)
        return dateStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const day = parts[2];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[monthNum - 1] || 'July';
    return `${monthName} ${parseInt(day, 10)}, ${year}`;
}

export default function ExpenseHistory({ transactions, categories, onDeleteTransaction, onViewAll }) {
    const recentTransactions = transactions.slice(0, 5);

    return (
        <section id="section-expense-history" className="overflow-x-hidden rounded-none border border-[#141414] bg-white p-3 sm:p-4 md:p-6 transition-all hover:shadow-[4px_4px_0px_0px_#141414]">
            <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
                <h2 className="font-serif text-xl italic font-semibold text-[#141414] md:text-2xl xl:text-3xl">Expense Archive</h2>
                <button
                    id="btn-history-view-all"
                    onClick={onViewAll}
                    className="border-b border-[#F27D26] pb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] transition-all hover:border-[#141414] hover:text-[#141414]"
                >
                    VIEW_ALL
                </button>
            </div>

            <div className="space-y-2" id="expense-list-container">
                {recentTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center" id="empty-state">
                        <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-none border border-[#141414]/30 bg-[#EBEBE4] sm:h-36 sm:w-36">
                            <img
                                alt="No transactions"
                                className="h-16 w-16 object-contain opacity-40 mix-blend-multiply sm:h-24 sm:w-24"
                                referrerPolicy="no-referrer"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVv4noyT68rx_k_c_R1zaEdDUiLGAc_gKWSR2VE2JFyXiELVbEwhjlRXZbgukealaTSekXiatDZpfJtYZU_CWHQkfW9ESZwm3Ta0OdzB9YkPr6JRtjp17WP8s7jrJCsRlBHl_-wt_IrIxMFNRWOUHq1r6Myy6XiMmFbEPNhgLg3ZkbtMup-MzXKVtyhe4hM1lf4TbOhe-SG7XMmbDnFHf36YvC9Ozb6jEak_EJcBT9P9ln6MZvT2Rk17SJlrpUYO3jJGe46utzEO94"
                            />
                        </div>
                        <h3 className="font-serif text-base italic font-bold text-[#141414]">Registry Empty</h3>
                        <p className="mt-1 max-w-xs text-xs text-[#141414]/65">
                            Your financial ledger file lists no active rows. Record your first studio expense above.
                        </p>
                    </div>
                ) : (
                    recentTransactions.map((tx) => {
                        const catDef = categories[tx.category] || INITIAL_CATEGORIES.Other;
                        return (
                            <div
                                key={tx.id}
                                id={`tx-row-${tx.id}`}
                                className="group flex flex-col gap-3 rounded-none border border-[#141414]/10 p-3 transition-all hover:border-[#141414] hover:bg-[#EBEBE4]/40 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#141414]/20 text-[#141414]"
                                        style={{ backgroundColor: `${catDef.color}30` }}
                                    >
                                        {getCategoryIcon(catDef.iconName)}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="break-words font-sans text-xs font-bold uppercase leading-tight tracking-wider text-[#141414]">
                                            {tx.name}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#141414]/60">
                                            <span>{formatDate(tx.date)}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="font-bold underline decoration-[#F27D26] decoration-2">{tx.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <span className="break-all font-serif text-base italic font-bold text-[#141414] sm:text-sm">
                                        {tx.type === 'expense' ? '-' : '+'}Rs{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>

                                    <button
                                        id={`btn-delete-tx-${tx.id}`}
                                        onClick={() => onDeleteTransaction(tx.id)}
                                        className="rounded-none border border-[#141414]/20 p-1.5 text-red-700 transition-all hover:border-transparent hover:bg-neutral-900 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                                        title="Delete record"
                                    >
                                        <Lucide.Trash2 className="h-3.5 w-3.5"/>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
