/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import Container from './Container';

export default function Footer() {
    return (
        <footer className="w-full bg-[#F5F5F0] border-t border-[#141414]/10 py-12 sm:py-14 lg:py-16 text-[#141414]">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-10 border-b border-[#141414]/10">
                    <div className="md:col-span-5 flex flex-col gap-3">
                        <Link to="/" className="flex items-center gap-2.5">
                            <img src="/favicon.svg" alt="Wealth Flow logo" className="w-7 h-7 rounded-md" />
                            <span className="font-headline-sm text-headline-sm text-[#141414] tracking-tight font-semibold">Wealth Flow</span>
                        </Link>
                        <p className="font-body-md text-body-md text-[#141414]/60 max-w-sm">Smart, simple expense tracking for everyday life.</p>
                    </div>
                    <div className="md:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-label-caps text-label-caps text-[#141414]/40 uppercase tracking-wider">Product</h3>
                            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-[#141414]/80">
                                <li className="hover:text-[#141414] transition-colors"><Link to="/">Home</Link></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#features">Features</a></li>
                                <li className="hover:text-[#141414] transition-colors"><Link to="/dashboard">Transactions</Link></li>
                                <li className="hover:text-[#141414] transition-colors"><Link to="/dashboard">Analytics</Link></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h3 className="font-label-caps text-label-caps text-[#141414]/40 uppercase tracking-wider">Company</h3>
                            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-[#141414]/80">
                                <li className="hover:text-[#141414] transition-colors"><a href="#">About</a></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Careers</a></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Press</a></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h3 className="font-label-caps text-label-caps text-[#141414]/40 uppercase tracking-wider">Legal</h3>
                            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-[#141414]/80">
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Privacy</a></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Terms</a></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Security</a></li>
                                <li className="hover:text-[#141414] transition-colors"><a href="#">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-body-sm text-body-sm text-[#141414]/40">&copy; 2026 Wealth Flow. All rights reserved.</p>
                    <p className="font-body-sm text-body-sm text-[#141414]/40">Monochrome Ledger Standard v2.4</p>
                </div>
            </Container>
        </footer>
    );
}
