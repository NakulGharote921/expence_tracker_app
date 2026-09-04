/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import BlurText from '../BlurText';
import ScrollFloat from '../ScrollFloat';
import Container from './Container';

export default function QuickActionsSection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] py-16 sm:py-20 lg:py-28 border-b border-[#141414]/10" id="how-it-works">
            <Container>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-12 lg:mb-16 gap-4">
                    <div className="max-w-2xl">
                        <BlurText text="High-Velocity Operations" delay={100} animateBy="words" direction="top" className="font-label-caps text-label-caps text-[#141414]/60 uppercase tracking-wider block mb-2" />
                        <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50%" scrollEnd="bottom bottom-=40%" stagger={0.03} containerClassName="font-headline-lg font-bold tracking-tight text-[#141414] w-full max-w-[900px]" textClassName="!text-[clamp(1.75rem,3.5vw,2.5rem)] !leading-[1.15]">
                            Intuitive workflows designed for speed.
                        </ScrollFloat>
                    </div>
                    <p className="font-body-md text-body-md text-[#141414]/70 max-w-md lg:text-right">Execute entries and navigate balances in under 3 seconds with friction-free command patterns.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {/* Left Featured Card */}
                    <div className="group bg-[#16131c] text-[#F5F5F0] border border-[#16131c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:border-[#16131c] shadow-sm flex flex-col justify-between w-full">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F5F5F0]/10 group-hover:bg-[#F5F5F0] group-hover:text-[#16131c] flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#F5F5F0] group-hover:text-[#16131c] transition-colors">shopping_bag</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full border border-[#F5F5F0]/30 font-label-caps text-label-caps uppercase opacity-70 hidden sm:inline">Primary Trigger</span>
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)' }} className="font-headline-lg font-bold mb-3 tracking-tight">Add Expense</h3>
                                <p className="font-body-lg text-body-lg opacity-80 transition-opacity max-w-md mb-5">Record your daily spending quickly. Instant classification and merchant indexing.</p>
                                <div className="p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F0]/10 border border-[#F5F5F0]/15 mb-6 transition-colors">
                                    <div className="flex items-center justify-between text-body-sm font-mono-numeric mb-2 gap-2">
                                        <span className="opacity-60 font-label-caps uppercase">Telemetry Latency</span>
                                        <span className="font-semibold whitespace-nowrap">&lt; 250ms Sync</span>
                                    </div>
                                    <div className="flex items-center justify-between text-body-sm font-mono-numeric gap-2">
                                        <span className="opacity-60 font-label-caps uppercase">Channels</span>
                                        <span className="font-semibold whitespace-nowrap">Cash \u2022 UPI \u2022 Credit \u2022 Debit</span>
                                    </div>
                                </div>
                            </div>
                            <Link to="/register" className="w-full py-3.5 px-6 rounded-xl font-headline-sm text-body-md font-semibold transition-all duration-200 border border-[#F5F5F0]/40 bg-[#F5F5F0] text-[#16131c] hover:bg-[#16131c] hover:text-[#F5F5F0] hover:border-[#F5F5F0] flex items-center justify-center gap-2">
                                <span>Add Expense</span>
                                <span className="material-symbols-outlined text-[18px]">north_east</span>
                            </Link>
                        </div>

                    {/* Right Stacked Cards */}
                    <div className="flex flex-col gap-5 sm:gap-6">
                        <div className="group bg-[#16131c] text-[#F5F5F0] border border-[#16131c] rounded-2xl sm:rounded-3xl p-5 sm:p-7 transition-all duration-300 hover:border-[#16131c] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 w-full">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F0]/10 group-hover:bg-[#F5F5F0] flex-shrink-0 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-xl sm:text-2xl text-[#F5F5F0] group-hover:text-[#16131c] transition-colors">account_balance_wallet</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-headline-md text-lg sm:text-xl font-bold mb-1 tracking-tight">Add Income</h3>
                                        <p className="font-body-md text-body-md opacity-80 transition-opacity">Keep your earnings organized. Split salary, dividends, capital yields, and invoices.</p>
                                    </div>
                                </div>
                                <Link to="/register" className="shrink-0 w-full sm:w-auto py-2.5 px-6 rounded-xl font-headline-sm text-body-md font-semibold transition-all duration-200 border border-[#F5F5F0]/40 bg-transparent text-[#F5F5F0] hover:bg-[#F5F5F0] hover:text-[#16131c] flex items-center justify-center gap-2 whitespace-nowrap">
                                    <span>Add Income</span>
                                    <span className="material-symbols-outlined text-[18px]">north_east</span>
                                </Link>
                            </div>

                        <div className="group bg-[#16131c] text-[#F5F5F0] border border-[#16131c] rounded-2xl sm:rounded-3xl p-5 sm:p-7 transition-all duration-300 hover:border-[#16131c] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 w-full">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F0]/10 group-hover:bg-[#F5F5F0] flex-shrink-0 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-xl sm:text-2xl text-[#F5F5F0] group-hover:text-[#16131c] transition-colors">monitoring</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-headline-md text-lg sm:text-xl font-bold mb-1 tracking-tight">View Analytics</h3>
                                        <p className="font-body-md text-body-md opacity-80 transition-opacity">Understand where your money goes. Spot leaks, project runway, and trim burn.</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="shrink-0 w-full sm:w-auto py-2.5 px-6 rounded-xl font-headline-sm text-body-md font-semibold transition-all duration-200 border border-[#F5F5F0]/40 bg-transparent text-[#F5F5F0] hover:bg-[#F5F5F0] hover:text-[#16131c] flex items-center justify-center gap-2 whitespace-nowrap">
                                    <span>View Analytics</span>
                                    <span className="material-symbols-outlined text-[18px]">north_east</span>
                                </Link>
                            </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
