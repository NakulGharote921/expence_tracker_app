/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Target, Check, ArrowRight, AlertCircle } from 'lucide-react';
export default function SetupPage({ profileName, onSubmit, onSkip }) {
    const [budgetAmount, setBudgetAmount] = useState('15000');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const budget = parseFloat(budgetAmount);
        if (!budget || budget <= 0) {
            setErrorMsg('A valid target budget amount is required to compile your ledger.');
            return;
        }
        setIsSubmitting(true);
        setErrorMsg('');
        setTimeout(() => {
            onSubmit(budget);
            setIsSubmitting(false);
        }, 700);
    };
    return (<div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex flex-col items-center justify-center p-4 select-none font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"/>

      <div className="w-full max-w-md flex flex-col items-center mb-8 z-10 text-center animate-fade-in">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#141414]/50 mb-3">
          WELCOME TO WEALTH_FLOW
        </span>
        <div className="w-14 h-14 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-xl shadow-md mb-4">
          { (profileName || 'W').charAt(0).toUpperCase() }
        </div>
        <h1 className="font-serif text-2xl italic text-[#141414] tracking-tight">Secure Ledger Initialization</h1>
        <p className="text-[10px] font-mono tracking-[0.15em] text-[#141414]/60 uppercase mt-2">
          Establish your financial parameters before entering the dashboard
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-[#141414] rounded-none shadow-[8px_8px_0px_0px_#141414] p-6 relative z-10 animate-[scale-up_0.25s_ease-out]">
        {errorMsg && (<div className="mb-4 p-3 bg-red-50 border border-red-250 text-red-800 text-xs rounded-none flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5"/>
            <span className="font-mono font-semibold text-[11px] leading-relaxed uppercase">{errorMsg}</span>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
              ESTABLISH TARGET BUDGET AMOUNT (INR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#141414]/50 font-mono text-[11px] font-bold">
                ₹
              </span>
              <Target className="absolute inset-y-0 right-0 pr-3 m-auto w-4 h-4 text-[#141414]/35 pointer-events-none"/>
              <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="e.g. 15000" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-8 pr-9 py-2.5 outline-none font-mono text-[#141414]" min="1" required/>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none shadow-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#141414]">
            {isSubmitting ? (<span>COMPILING SECURE INDEX...</span>) : (<>
                <span>CONFIRM FINANCIAL PARAMETERS</span>
                <Check className="w-4 h-4"/>
              </>)}
          </button>

          <button type="button" onClick={onSkip} className="w-full text-center text-[10px] font-mono font-bold text-[#141414]/50 hover:text-[#F27D26] uppercase tracking-widest py-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            Configure later
            <ArrowRight className="w-3.5 h-3.5"/>
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-[10px] font-mono tracking-widest text-[#141414]/50 z-10">
        LEDGER SECURED BY AES-256 SYMMETRIC CELLULAR BLOCKCHAIN. ALL MATRIX ENTRIES INDEPENDENTLY AUDITED.
      </div>
    </div>);
}
