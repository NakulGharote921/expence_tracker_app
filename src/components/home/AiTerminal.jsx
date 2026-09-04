/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* ── AI terminal: complete entry ───────────────────────── */
export function AiTerminalComplete() {
    return (
            <div className="text-[#F5F5F0] p-5 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                    <div className="flex items-center justify-between border-b border-[#F5F5F0]/10 pb-4 mb-5 sm:mb-6 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-3 h-3 rounded-full bg-[#F5F5F0]/20 shrink-0" />
                            <span className="w-3 h-3 rounded-full bg-[#F5F5F0]/20 shrink-0" />
                            <span className="w-3 h-3 rounded-full bg-[#F5F5F0]/20 shrink-0" />
                            <span className="font-mono-numeric text-body-sm text-[#F5F5F0]/60 ml-1 truncate">parser-v2.engine</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F0]/10 font-label-caps text-label-caps text-[#F5F5F0]/80 shrink-0">99.8% Match</span>
                    </div>
                    <div className="flex flex-col items-end mb-5">
                        <span className="font-label-caps text-label-caps text-[#F5F5F0]/40 mb-1">Input Text</span>
                        <div className="bg-[#F5F5F0]/10 border border-[#F5F5F0]/15 text-[#F5F5F0] rounded-2xl rounded-tr-sm p-4 w-full">
                            <p className="font-body-md text-body-md">&ldquo;Spent \u20B9850 on dinner with friends using UPI.&rdquo;</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start mb-5 sm:mb-6">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#F5F5F0]/80">smart_toy</span>
                            <span className="font-label-caps text-label-caps text-[#F5F5F0]/60 uppercase">Extracted Entities</span>
                        </div>
                        <div className="bg-[#1c1b1b] border border-[#F5F5F0]/20 rounded-2xl rounded-tl-sm p-4 sm:p-5 w-full min-w-0">
                            <p className="font-body-md text-body-md text-[#F5F5F0]/90 mb-3">I detected the following parameters:</p>
                            <div className="space-y-2 font-mono-numeric text-body-sm text-[#F5F5F0]/80 bg-[#F5F5F0]/5 p-3 sm:p-3.5 rounded-xl border border-[#F5F5F0]/10">
                                {[
                                    { label: 'Amount', value: '\u20B9850.00' },
                                    { label: 'Category', value: 'Food & Dining' },
                                    { label: 'Payment Method', value: 'UPI' },
                                    { label: 'Description', value: 'Dinner with friends' },
                                    { label: 'Date', value: 'Today, 8:45 PM' },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between gap-2">
                                        <span className="shrink-0">{item.label}</span>
                                        <span className="text-[#F5F5F0] font-bold text-right">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="font-body-sm text-body-sm text-[#F5F5F0]/60 mt-3 mb-4">Add this expense to your primary ledger?</p>
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="bg-[#F5F5F0] text-[#141414] px-4 sm:px-5 py-2.5 rounded-lg font-headline-sm text-body-md font-semibold hover:bg-[#141414] hover:text-[#F5F5F0] hover:border hover:border-[#F5F5F0] transition-colors">Confirm Entry</button>
                                <button className="border border-[#F5F5F0]/30 text-[#F5F5F0] px-4 sm:px-5 py-2.5 rounded-lg font-headline-sm text-body-md font-medium hover:bg-[#141414] hover:border-[#F5F5F0] transition">Edit Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}

/* ── AI terminal: fallback ─────────────────────────────── */
export function AiTerminalFallback() {
    const options = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];
    return (
            <div className="text-[#F5F5F0] p-5 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                    <div className="flex items-center justify-between border-b border-[#F5F5F0]/10 pb-4 mb-5 sm:mb-6 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[18px] text-[#F5F5F0] shrink-0">tune</span>
                            <span className="font-headline-sm text-headline-sm font-semibold truncate">Missing Parameter Fallback</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F0]/10 font-label-caps text-label-caps text-[#F5F5F0]/80 shrink-0">Zero Friction</span>
                    </div>
                    <div className="flex flex-col items-end mb-5">
                        <span className="font-label-caps text-label-caps text-[#F5F5F0]/40 mb-1">User Query</span>
                        <div className="bg-[#F5F5F0]/10 border border-[#F5F5F0]/15 text-[#F5F5F0] rounded-2xl rounded-tr-sm p-4 w-full">
                            <p className="font-body-md text-body-md">&ldquo;Spent \u20B9500 on groceries.&rdquo;</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start mb-5 sm:mb-6">
                        <div className="bg-[#1c1b1b] border border-[#F5F5F0]/20 rounded-2xl rounded-tl-sm p-4 sm:p-5 w-full min-w-0">
                            <p className="font-body-md text-body-md text-[#F5F5F0] font-medium mb-1">Parsed: \u20B9500 &bull; Groceries</p>
                            <p className="font-body-sm text-[#F5F5F0]/70 mb-4">How did you pay for this purchase?</p>
                            <div className="flex flex-wrap gap-2">
                                {options.map((o, i) => (
                                    <button key={o} className={`px-3 sm:px-4 py-2 rounded-xl border font-body-sm font-medium transition ${i === 1 ? 'bg-[#F5F5F0] text-[#141414] font-bold shadow' : 'border-[#F5F5F0]/30 hover:border-[#F5F5F0] hover:bg-[#141414] hover:text-[#F5F5F0]'}`}>{o}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F5F0]/5 border border-[#F5F5F0]/10 flex items-start sm:items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-[#F5F5F0] shrink-0 mt-0.5 sm:mt-0">auto_awesome</span>
                    <p className="font-body-sm text-body-sm text-[#F5F5F0]/80 min-w-0">
                        <strong className="text-[#F5F5F0] font-semibold">Zero redundant steps:</strong>{' '}
                        Wealth Flow only prompts when mandatory financial parameters are missing from the raw voice or text string.
                    </p>
                </div>
            </div>
    );
}
