/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import Container from './Container';
import TrajectoryChart from './TrajectoryChart';
import TextType from '../TextType';

export default function HeroSection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] pt-14 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28 relative border-b border-[#141414]/10">
            <Container>
                {/* Hero */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
                    <TextType
                        as="h1"
                        text={["Take Control of Your Money."]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        deletingSpeed={50}
                        showCursor
                        cursorCharacter="_"
                        className="font-display-hero font-extrabold tracking-[-0.04em] text-[#141414] leading-[0.97] mb-5 sm:mb-6 block"
                        style={{ fontSize: 'clamp(2.625rem, 7vw, 5.5rem)' }}
                    />
                    <p className="text-[#141414]/70 leading-relaxed mb-8 sm:mb-10 max-w-[780px]"
                        style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)' }}>
                        Track expenses, manage income, understand your spending, and make smarter financial decisions — all in one simple, architectural workspace.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8 sm:mb-10">
                        <Link to="/register" className="w-full sm:w-auto max-w-[340px] sm:max-w-none inline-flex items-center justify-center border border-[#141414] bg-[#141414]/5 text-[#141414] font-headline-sm text-body-md font-semibold h-12 px-9 rounded-xl hover:bg-[#141414] hover:text-[#F5F5F0] active:scale-[0.98] transition-all duration-200 shadow-sm">
                            Get Started Free
                        </Link>
                        <Link to="/dashboard" className="w-full sm:w-auto max-w-[340px] sm:max-w-none inline-flex items-center justify-center bg-transparent border border-[#141414]/30 text-[#141414] font-headline-sm text-body-md font-semibold h-12 px-9 rounded-xl hover:border-[#141414] hover:bg-[#141414] hover:text-[#F5F5F0] active:scale-[0.98] transition-all duration-200">
                            Explore Dashboard
                        </Link>
                    </div>
                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-body-sm text-body-sm text-[#141414]/60 border-t border-[#141414]/10 pt-5 sm:pt-6">
                        <span className="inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-[#141414]">lock</span>
                            Encrypted &amp; Private
                        </span>
                        <span className="text-[#141414]/30">&bull;</span>
                        <span className="inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-[#141414]">verified</span>
                            Zero Hidden Fees
                        </span>
                        <span className="text-[#141414]/30">&bull;</span>
                        <span className="inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-[#141414]">account_balance</span>
                            UPI &amp; Multi-Bank Ready
                        </span>
                    </div>
                </div>

                {/* Dashboard Preview Card */}
                <div className="max-w-[1220px] mx-auto">
                        <div className="bg-[#FFFFFF] text-[#141414] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-[#141414]/10 overflow-hidden">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#141414]/10 pb-4 sm:pb-5 mb-5 sm:mb-6 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#141414] shrink-0" />
                                    <span className="font-headline-sm text-headline-sm font-semibold tracking-tight">Active Portfolio</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#141414]/5 text-[#141414]/70 font-mono-numeric text-body-sm border border-[#141414]/10">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        March 2026
                                    </div>
                                    <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-[#141414]/60">
                                        {['Cash', 'UPI', 'Credit', 'Debit'].map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded border border-[#141414]/15 bg-[#141414]/5">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6 lg:mb-8">
                                {[
                                    { label: 'Total Balance', value: '\u20B984,250' },
                                    { label: 'Income', value: '\u20B91,20,000' },
                                    { label: 'Expenses', value: '\u20B935,750' },
                                    { label: 'Savings', value: '\u20B984,250' },
                                ].map((m) => (
                                    <div key={m.label} className="p-3 sm:p-4 bg-[#F5F5F0]/80 rounded-xl sm:rounded-2xl border border-[#141414]/8 min-w-0">
                                        <p className="font-label-caps text-label-caps text-[#141414]/60 uppercase mb-1 truncate">{m.label}</p>
                                        <p className="font-mono-numeric text-xl sm:text-2xl font-bold tracking-tight text-[#141414] truncate">{m.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chart + Transactions */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
                                <div className="lg:col-span-6 min-w-0">
                                    <div className="bg-[#F5F5F0] border border-[#141414]/10 rounded-2xl p-4 sm:p-5 lg:p-6 mb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1 sm:gap-2">
                                            <span className="text-xs sm:text-sm font-medium uppercase tracking-wide text-[#141414]/60">30-Day Expense Trajectory</span>
                                            <span className="text-base sm:text-lg font-medium text-[#141414]">Avg ₹1,191 / day</span>
                                        </div>
                                        <div className="w-full" style={{ height: 'clamp(180px, 22vw, 260px)' }}>
                                            <TrajectoryChart />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#141414] text-[#F5F5F0] font-label-caps text-label-caps">Housing 38%</span>
                                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#141414]/10 text-[#141414] font-label-caps text-label-caps">Groceries 22%</span>
                                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#141414]/10 text-[#141414] font-label-caps text-label-caps">Dining 16%</span>
                                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#141414]/10 text-[#141414] font-label-caps text-label-caps">Transport 14%</span>
                                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#141414]/10 text-[#141414] font-label-caps text-label-caps">Utilities 10%</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 min-w-0 border-t lg:border-t-0 lg:border-l border-[#141414]/10 pt-5 lg:pt-0 lg:pl-6 sm:lg:pl-8">
                                    <div className="flex flex-col">
                                        {[
                                            { icon: 'shopping_basket', name: 'Whole Foods Market', meta: 'Grocery \u2022 UPI', amount: '-\u20B92,450.00', positive: false },
                                            { icon: 'payments', name: 'Client Retainer Payout', meta: 'Income \u2022 Direct Bank', amount: '+\u20B945,000.00', positive: true },
                                            { icon: 'local_cafe', name: 'Artisan Coffee Roasters', meta: 'Dining \u2022 Credit Card', amount: '-\u20B9380.00', positive: false },
                                        ].map((t) => (
                                            <div key={t.name} className="flex items-center justify-between text-body-sm py-3 border-b border-[#141414]/5 last:border-b-0 gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-[#141414]/5 flex items-center justify-center text-[#141414] shrink-0">
                                                        <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-body-md font-medium text-[#141414] leading-tight truncate">{t.name}</p>
                                                        <p className="font-body-sm text-[#141414]/50 truncate">{t.meta}</p>
                                                    </div>
                                                </div>
                                                <span className={`font-mono-numeric font-semibold text-[#141414] whitespace-nowrap shrink-0 ${t.positive ? 'font-bold' : ''}`}>{t.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-[#141414]/10 mt-3 gap-2">
                                        <span className="font-label-caps text-label-caps uppercase text-[#141414]/60">Supported Channels:</span>
                                        <div className="flex items-center gap-1.5 font-label-caps text-label-caps flex-wrap">
                                            {['Cash', 'UPI', 'Credit', 'Debit'].map((ch) => (
                                                <span key={ch} className="px-2 py-0.5 rounded border border-[#141414]/15 bg-[#141414]/5 text-[#141414]">{ch}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </Container>
        </section>
    );
}
