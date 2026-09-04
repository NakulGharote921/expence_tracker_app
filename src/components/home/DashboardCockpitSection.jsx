/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import BlurText from '../BlurText';
import ScrollFloat from '../ScrollFloat';
import BorderGlow from '../BorderGlow';
import Container from './Container';
import TwelveMonthChart from './TwelveMonthChart';

const LEDGER_TXNS = [
    { date: '26 Mar, 14:20', merchant: 'Whole Foods Market', classification: 'Groceries', instrument: 'UPI \u2022 PhonePe', status: 'Reconciled', amount: '-\u20B92,450.00', positive: false },
    { date: '25 Mar, 10:15', merchant: 'Client Retainer Payout', classification: 'Consulting Income', instrument: 'Bank Wire \u2022 HDFC', status: 'Settled', amount: '+\u20B945,000.00', positive: true },
    { date: '24 Mar, 09:30', merchant: 'Artisan Coffee Roasters', classification: 'Dining', instrument: 'Credit \u2022 Axis Visa', status: 'Reconciled', amount: '-\u20B9380.00', positive: false },
    { date: '23 Mar, 18:45', merchant: 'Urban Mobility Cab', classification: 'Transport', instrument: 'UPI \u2022 Paytm', status: 'Reconciled', amount: '-\u20B9420.00', positive: false },
];

const EXPENSE_BREAKDOWN = [
    { label: 'Housing & Rent', amount: '\u20B913,585', pct: 38, opacity: '' },
    { label: 'Groceries & Staples', amount: '\u20B97,865', pct: 22, opacity: '80' },
    { label: 'Dining & Social', amount: '\u20B95,720', pct: 16, opacity: '60' },
    { label: 'Transport & Fuel', amount: '\u20B95,005', pct: 14, opacity: '40' },
];

export default function DashboardCockpitSection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] py-16 sm:py-20 lg:py-28 border-b border-[#141414]/10" id="dashboard">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
                    <BlurText text="Centralized Visibility" delay={100} animateBy="words" direction="top" className="font-label-caps text-label-caps text-[#141414]/50 uppercase tracking-widest block mb-2" />
                    <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50%" scrollEnd="bottom bottom-=40%" stagger={0.03} containerClassName="font-display-hero font-extrabold tracking-tight text-[#141414] w-full max-w-[1000px]" textClassName="!text-[clamp(1.75rem,4vw,3rem)] !leading-[1.1]">
                        Your finances. One clear view.
                    </ScrollFloat>
                    <p className="font-body-lg text-body-lg text-[#141414]/70 mt-3">A unified cockpit for every rupee earned, saved, and invested across all financial accounts.</p>
                </div>

                <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="#16131C"
                    borderRadius={28}
                    glowRadius={40}
                    glowIntensity={1}
                    coneSpread={25}
                    animated={false}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                >
                    <div className="bg-[#FFFFFF] text-[#141414] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 border border-[#141414]/12 shadow-xl overflow-hidden">
                        {/* Cockpit Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#141414]/10 pb-5 mb-6 lg:mb-8 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-label-caps text-label-caps text-[#141414]/60 uppercase tracking-wider">Executive Overview</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#141414] text-[#F5F5F0]">LIVE SYNC</span>
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)' }} className="font-headline-lg font-bold tracking-tight">Main Operating Ledger</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <div className="inline-flex rounded-xl bg-[#141414]/5 p-1 border border-[#141414]/10">
                                    <button className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#141414] text-[#F5F5F0] font-label-caps text-label-caps uppercase whitespace-nowrap">General Ledger</button>
                                    <button className="px-3 sm:px-3.5 py-1.5 rounded-lg text-[#141414]/70 font-label-caps text-label-caps uppercase hover:text-[#141414] whitespace-nowrap">Cashflow</button>
                                    <button className="px-3 sm:px-3.5 py-1.5 rounded-lg text-[#141414]/70 font-label-caps text-label-caps uppercase hover:text-[#141414] whitespace-nowrap">Budgets</button>
                                </div>
                                <span className="px-3 sm:px-3.5 py-1.5 rounded-xl border border-[#141414]/20 bg-[#141414]/5 font-mono-numeric text-body-sm font-semibold whitespace-nowrap">Q1 2026</span>
                            </div>
                        </div>

                        {/* 4-Stat Bar */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
                            {[
                                { label: 'Net Balance', value: '\u20B984,250', sub: '+14.2% from previous month' },
                                { label: 'Monthly Inflow', value: '\u20B91,20,000', sub: '2 deposit events logged' },
                                { label: 'Monthly Outflow', value: '\u20B935,750', sub: 'Under monthly \u20B945,000 cap' },
                                { label: 'Retained Capital', value: '\u20B984,250', sub: '70.2% Net Savings Rate' },
                            ].map((stat) => (
                                <div key={stat.label} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F5F5F0]/80 border border-[#141414]/10 min-w-0">
                                    <span className="font-label-caps text-label-caps text-[#141414]/60 uppercase block mb-1 truncate">{stat.label}</span>
                                    <span className="font-mono-numeric text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#141414] block truncate">{stat.value}</span>
                                    <span className="block font-body-sm text-body-sm text-[#141414]/60 mt-1 truncate">{stat.sub}</span>
                                </div>
                            ))}
                        </div>

                        {/* Split Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 lg:mb-8">
                            <div className="lg:col-span-7 bg-[#F5F5F0]/50 border border-[#141414]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <div>
                                        <h4 className="font-headline-sm text-headline-sm font-semibold text-[#141414]">12-Month Inflow vs Outflow</h4>
                                        <p className="font-body-sm text-body-sm text-[#141414]/60">Monochrome annualized variance tracking</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-body-sm font-label-caps text-label-caps shrink-0">
                                        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1 bg-[#141414] rounded" /> Inflow</span>
                                        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1 bg-[#141414]/30 rounded" /> Outflow</span>
                                    </div>
                                </div>
                                <div className="w-full relative pt-2" style={{ height: 'clamp(160px, 20vw, 240px)' }}>
                                    <TwelveMonthChart />
                                </div>
                                <div className="flex justify-between font-mono-numeric text-body-sm text-[#141414]/50 pt-2 border-t border-[#141414]/10 text-[10px] sm:text-body-sm">
                                    {['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb', 'Mar'].map((m) => (
                                        <span key={m}>{m}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5 bg-[#F5F5F0]/50 border border-[#141414]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between min-w-0">
                                <div>
                                    <h4 className="font-headline-sm text-headline-sm font-semibold text-[#141414] mb-1">Expense Breakdown</h4>
                                    <p className="font-body-sm text-body-sm text-[#141414]/60 mb-5">Proportional capital deployment by category</p>
                                    <div className="space-y-3 sm:space-y-4">
                                        {EXPENSE_BREAKDOWN.map((item) => (
                                            <div key={item.label}>
                                                <div className="flex justify-between font-body-sm mb-1.5 gap-2">
                                                    <span className="font-medium text-[#141414] truncate">{item.label}</span>
                                                    <span className="font-mono-numeric font-bold text-[#141414] whitespace-nowrap">{item.amount} ({item.pct}%)</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-[#141414]/10 overflow-hidden">
                                                    <div className={`h-full bg-[#141414]${item.opacity ? `/${item.opacity}` : ''} rounded-full`} style={{ width: `${item.pct}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#141414]/10 mt-5 flex items-center justify-between text-[#141414]/60 text-body-sm font-mono-numeric">
                                    <span>Total Segmented: 4</span>
                                    <span>Audited Period: 30D</span>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="min-w-0">
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <h4 className="font-headline-sm text-headline-sm font-semibold text-[#141414]">Recent Ledger Entries</h4>
                                <Link to="/dashboard" className="font-label-caps text-label-caps text-[#141414] underline underline-offset-4 hover:opacity-75 uppercase whitespace-nowrap">View Full Audit Log</Link>
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-[#141414]/10 text-label-caps font-label-caps text-[#141414]/60 uppercase">
                                            <th className="py-3 px-2">Merchant</th>
                                            <th className="py-3 px-2 hidden sm:table-cell">Classification</th>
                                            <th className="py-3 px-2 hidden md:table-cell">Instrument</th>
                                            <th className="py-3 px-2 hidden lg:table-cell">Timestamp</th>
                                            <th className="py-3 px-2">Status</th>
                                            <th className="py-3 px-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#141414]/10 font-body-md text-body-md text-[#141414]">
                                        {LEDGER_TXNS.map((row) => (
                                            <tr key={row.date + row.merchant}>
                                                <td className="py-3 sm:py-3.5 px-2 font-medium">{row.merchant}</td>
                                                <td className="py-3 sm:py-3.5 px-2 text-[#141414]/70 hidden sm:table-cell">{row.classification}</td>
                                                <td className="py-3 sm:py-3.5 px-2 font-mono-numeric text-body-sm hidden md:table-cell">{row.instrument}</td>
                                                <td className="py-3 sm:py-3.5 px-2 text-[#141414]/60 font-mono-numeric text-body-sm hidden lg:table-cell">{row.date}</td>
                                                <td className="py-3 sm:py-3.5 px-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${row.status === 'Settled' ? 'bg-[#141414] text-[#F5F5F0]' : 'bg-[#141414]/10 text-[#141414]'}`}>{row.status}</span>
                                                </td>
                                                <td className="py-3 sm:py-3.5 px-2 text-right font-mono-numeric font-bold whitespace-nowrap">{row.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </BorderGlow>
            </Container>
        </section>
    );
}
