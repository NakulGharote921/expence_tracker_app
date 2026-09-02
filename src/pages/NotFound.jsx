/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
    const { session } = useAuth();
    const target = session ? '/dashboard' : '/login';
    const label = session ? 'Return to Dashboard' : 'Go to Login';

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center p-4 font-sans">
            <div className="bg-white border border-[#141414] shadow-[6px_6px_0px_0px_#F27D26] p-8 sm:p-12 text-center max-w-md w-full">
                <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141414]/40">CURATED LEDGER</span>
                <h1 className="font-serif text-5xl italic font-semibold mt-4">404</h1>
                <p className="mt-3 text-xs font-mono uppercase tracking-widest text-[#141414]/60">Page not found on the ledger</p>
                <Link
                    to={target}
                    className="inline-block mt-7 bg-[#141414] hover:bg-[#F27D26] text-white py-3 px-6 text-[11px] font-mono uppercase tracking-widest font-bold transition-all"
                >
                    {label}
                </Link>
            </div>
        </div>
    );
}