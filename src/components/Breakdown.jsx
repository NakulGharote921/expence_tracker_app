/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { PieChart, Download, FileSpreadsheet } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../mockData';

export default function Breakdown({ transactions, categories }) {
    const [showToast, setShowToast] = useState(false);

    const expensesOnly = transactions.filter((t) => t.type === 'expense');
    const totalExpenseINR = expensesOnly.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryTotals = Object.keys(categories).reduce((acc, catName) => {
        acc[catName] = 0;
        return acc;
    }, {});

    expensesOnly.forEach((tx) => {
        if (categoryTotals[tx.category] !== undefined) {
            categoryTotals[tx.category] += tx.amount;
        } else {
            categoryTotals.Other = (categoryTotals.Other || 0) + tx.amount;
        }
    });

    const breakdownList = Object.keys(categories)
        .map((catName) => {
            const amount = categoryTotals[catName] || 0;
            const percentage = totalExpenseINR > 0 ? (amount / totalExpenseINR) * 100 : 0;
            return {
                category: catName,
                amount,
                percentage,
                meta: categories[catName] || INITIAL_CATEGORIES.Other,
            };
        })
        .sort((a, b) => b.amount - a.amount);

    const handleDownloadCSV = () => {
        try {
            const csvHeaders = ['Transaction ID', 'Name', 'Amount (INR)', 'Category', 'Date', 'Type'];
            const csvRows = transactions.map((t) => [
                t.id,
                `"${t.name.replace(/"/g, '""')}"`,
                t.amount,
                t.category,
                t.date,
                t.type,
            ]);
            const csvContent = [csvHeaders, ...csvRows].map((row) => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'WealthFlow_Accounting_Report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <section id="section-breakdown" className="relative flex h-full flex-col justify-between overflow-x-hidden rounded-none border border-[#141414] bg-white p-3 sm:p-4 md:p-6 transition-all hover:shadow-[4px_4px_0px_0px_#141414]">
            <div>
                <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
                    <h2 className="font-serif text-xl italic font-semibold text-[#141414] md:text-2xl xl:text-3xl">Allocation Analysis</h2>
                    <PieChart className="h-4 w-4 text-[#F27D26]"/>
                </div>

                <div className="space-y-4" id="breakdown-bars-container">
                    {breakdownList.map(({ category, amount, percentage, meta }) => {
                        const barPercentage = Math.max(0.5, percentage);
                        return (
                            <div key={category} id={`breakdown-item-${category}`}>
                                <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                    <span className="flex min-w-0 items-center gap-2 break-words text-[11px] font-bold uppercase tracking-wider text-[#141414]">
                                        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-none border border-[#141414]" style={{ backgroundColor: meta.color }}/>
                                        {category}
                                    </span>
                                    <span className="text-left font-mono text-[10px] font-bold text-[#141414]/70 sm:text-right sm:text-[11px]">
                                        Rs{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {Math.round(percentage)}%
                                    </span>
                                </div>

                                <div className="h-2.5 w-full overflow-hidden rounded-none border border-[#141414]/15 bg-[#EBEBE4]">
                                    <div
                                        className="h-full rounded-none transition-all duration-500 ease-out"
                                        style={{ width: `${barPercentage}%`, backgroundColor: meta.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="relative mt-8 border-t border-[#141414]/10 pt-4">
                <button
                    id="btn-download-report"
                    onClick={handleDownloadCSV}
                    className="flex w-full items-center justify-center gap-2 rounded-none border border-[#141414] bg-[#141414] py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#F27D26]"
                >
                    <Download className="h-4 w-4"/>
                    EXPORT LEDGER (.CSV)
                </button>

                {showToast && (
                    <div className="absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-none border border-[#F27D26] bg-[#141414] px-3.5 py-2 font-mono text-[10px] font-bold tracking-wider text-[#F5F5F0] shadow-lg animate-fade-in-up">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-[#F27D26]"/>
                        <span>EXPORT_SUCCESS</span>
                    </div>
                )}
            </div>
        </section>
    );
}
