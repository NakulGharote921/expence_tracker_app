/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import BlurText from '../BlurText';
import ScrollFloat from '../ScrollFloat';
import Container from './Container';

export default function FeaturesBentoSection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] py-16 sm:py-20 lg:py-28 border-b border-[#141414]/10" id="features">
            <Container>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-14 lg:mb-16 gap-4 lg:gap-8">
                    <div className="max-w-2xl">
                        <BlurText text="Capabilities Matrix" delay={100} animateBy="words" direction="top" className="font-label-caps text-label-caps text-[#141414]/50 uppercase tracking-widest block mb-2" />
                        <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50%" scrollEnd="bottom bottom-=40%" stagger={0.03} containerClassName="font-display-hero font-extrabold tracking-tight text-[#141414] w-full max-w-[1000px]" textClassName="!text-[clamp(1.75rem,4vw,3rem)] !leading-[1.1]">
                            Everything You Need to Manage Your Money.
                        </ScrollFloat>
                    </div>
                    <p className="font-body-lg text-body-lg text-[#141414]/70 max-w-md lg:text-right shrink-0">An uncompromising suite of precision instruments built for personal capital governance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
                            <span className="font-label-caps text-label-caps text-[#141414]/50 uppercase tracking-wider">Cluster 01 / Core Ledger Operations</span>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#141414]/12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#141414]/40 transition-colors duration-200 flex flex-col justify-between shadow-sm min-h-[240px]">
                            <div>
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#141414]/5 flex items-center justify-center text-[#141414] mb-4 sm:mb-5">
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">receipt_long</span>
                                </div>
                                <h3 className="font-headline-md text-lg sm:text-xl font-semibold text-[#141414] mb-2">Smart Expense Tracking</h3>
                                <p className="font-body-md text-body-md text-[#141414]/70 leading-relaxed">Track daily expenditures and organize them by category seamlessly with instant search, auto-merchant normalization, and custom tag hierarchies.</p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-[#141414]/10 flex items-center justify-between text-[#141414]/40 font-mono-numeric text-body-sm">
                                <span>F-01</span><span>Real-time Sync</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {[
                                { icon: 'account_balance', code: 'F-02', tag: 'Multi-Account', title: 'Income Management', desc: 'Record and monitor multiple inflow streams across salary, dividends, freelance retainers, and liquid capital yields.' },
                                { icon: 'credit_card', code: 'F-04', tag: 'Omnichannel', title: 'Payment Methods', desc: 'Native handling for Cash, UPI, Credit Card, Debit Card, and Inter-bank Transfers with automated settlement logs.' },
                            ].map((f) => (
                                <div key={f.code} className="bg-[#FFFFFF] border border-[#141414]/12 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-[#141414]/40 transition-colors duration-200 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141414]/5 flex items-center justify-center text-[#141414] mb-3 sm:mb-4">
                                            <span className="material-symbols-outlined text-lg sm:text-xl">{f.icon}</span>
                                        </div>
                                        <h3 className="font-headline-sm text-headline-sm font-semibold text-[#141414] mb-2">{f.title}</h3>
                                        <p className="font-body-sm text-body-sm text-[#141414]/70 leading-relaxed">{f.desc}</p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#141414]/10 flex items-center justify-between text-[#141414]/40 font-mono-numeric text-body-sm">
                                        <span>{f.code}</span><span>{f.tag}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
                            <span className="font-label-caps text-label-caps text-[#141414]/50 uppercase tracking-wider">Cluster 02 / Intelligence &amp; Protection</span>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#141414]/12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#141414]/40 transition-colors duration-200 flex flex-col justify-between shadow-sm min-h-[240px]">
                            <div>
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#141414]/5 flex items-center justify-center text-[#141414] mb-4 sm:mb-5">
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">psychology</span>
                                </div>
                                <h3 className="font-headline-md text-lg sm:text-xl font-semibold text-[#141414] mb-2">AI Entry Assistant</h3>
                                <p className="font-body-md text-body-md text-[#141414]/70 leading-relaxed">Add expenses using natural human phrases like &ldquo;Spent \u20B9500 on groceries using UPI.&rdquo; The engine infers amount, category, date, and payment medium instantly.</p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-[#141414]/10 flex items-center justify-between text-[#141414]/40 font-mono-numeric text-body-sm">
                                <span>F-03</span><span>Zero-Form Entry</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div className="bg-[#FFFFFF] border border-[#141414]/12 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-[#141414]/40 transition-colors duration-200 flex flex-col justify-between shadow-sm">
                                <div>
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141414]/5 flex items-center justify-center text-[#141414] mb-3 sm:mb-4">
                                        <span className="material-symbols-outlined text-lg sm:text-xl">query_stats</span>
                                    </div>
                                    <h3 className="font-headline-sm text-headline-sm font-semibold text-[#141414] mb-2">Analytics Engine</h3>
                                    <p className="font-body-sm text-body-sm text-[#141414]/70 leading-relaxed">Understand spending patterns through clear monochrome visualizations, cashflow trends, and burn rate forecasts.</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#141414]/10 flex items-center justify-between text-[#141414]/40 font-mono-numeric text-body-sm">
                                    <span>F-05</span><span>Descriptive AI</span>
                                </div>
                            </div>
                            <div className="bg-[#141414] text-[#F5F5F0] border border-[#141414] rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-[#141414]/40 transition-colors duration-200 flex flex-col justify-between shadow-md">
                                <div>
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F5F5F0]/10 flex items-center justify-center text-[#F5F5F0] mb-3 sm:mb-4">
                                        <span className="material-symbols-outlined text-lg sm:text-xl">security</span>
                                    </div>
                                    <h3 className="font-headline-sm text-headline-sm font-semibold text-[#F5F5F0] mb-2">Secure Vault Isolation</h3>
                                    <p className="font-body-sm text-body-sm text-[#F5F5F0]/70 leading-relaxed">Protect every user&apos;s ledger behind bank-grade client-side encryption. Zero advertising cookies, zero third-party telemetry.</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#F5F5F0]/10 flex items-center justify-between text-[#F5F5F0]/40 font-mono-numeric text-body-sm">
                                    <span>F-06</span><span>End-to-End Encrypted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
