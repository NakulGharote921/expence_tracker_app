/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
export default function LoginPage({ onLogin }) {
    const [activeTab, setActiveTab] = useState('signin');
    // Sign in states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Sign up states
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpPremium, setSignUpPremium] = useState(true);
    // Common UI states
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [budgetAmount, setBudgetAmount] = useState('15000');
    const [startingCost, setStartingCost] = useState('12450.80');
    const handleSignInSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMsg('Please supply code parameters for all input fields.');
            return;
        }
        if (password.length < 6) {
            setErrorMsg('Password integrity check failed. Minimum 6 character length is required.');
            return;
        }
        setIsSubmitting(true);
        setErrorMsg('');
        // Simulate clean authentication validation
        setTimeout(() => {
            const finalName = email.split('@')[0];
            onLogin(finalName, email, true, parseFloat(budgetAmount), parseFloat(startingCost));
            setIsSubmitting(false);
        }, 850);
    };
    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        if (!signUpName || !signUpEmail || !signUpPassword) {
            setErrorMsg('All verification parameters must be specified for ledger creation.');
            return;
        }
        if (signUpPassword.length < 6) {
            setErrorMsg('Registry error: Password must be at least 6 characters for lock integrity.');
            return;
        }
        setIsSubmitting(true);
        setErrorMsg('');
        setTimeout(() => {
            onLogin(signUpName, signUpEmail, signUpPremium, parseFloat(budgetAmount), parseFloat(startingCost));
            setIsSubmitting(false);
        }, 950);
    };
    return (<div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex flex-col items-center justify-center p-4 select-none font-sans relative overflow-hidden">
      
      {/* Absolute Decorative Grid Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"/>
      
      {/* Aesthetic brand centerpiece */}
      <div className="w-full max-w-md flex flex-col items-center mb-8 z-10 text-center animate-fade-in">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#141414]/50 mb-2">
          FINTECH LEDGER HUB
        </span>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-lg shadow-md">
            W
          </div>
          <span className="font-serif text-3xl italic text-[#141414] tracking-tight">Wealth_Flow</span>
        </div>
        
        <p className="text-[10px] font-mono tracking-[0.15em] text-[#F27D26] uppercase font-bold mt-2.5">
          Curated double-entry cash performance logs
        </p>
      </div>

      {/* Main Login Card Wrapper */}
      <div className="w-full max-w-md bg-white border-2 border-[#141414] rounded-none shadow-[8px_8px_0px_0px_#141414] p-6 relative z-10 animate-[scale-up_0.25s_ease-out]">
        
        {/* Card Header Tab Selector */}
        <div className="flex bg-[#EBEBE4] p-1 border border-[#141414] rounded-none mb-6">
          <button onClick={() => {
            setActiveTab('signin');
            setErrorMsg('');
        }} className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer ${activeTab === 'signin'
            ? 'bg-[#141414] text-white'
            : 'text-[#141414]/60 hover:bg-[#141414]/10'}`}>
            SIGN IN
          </button>
          <button onClick={() => {
            setActiveTab('signup');
            setErrorMsg('');
        }} className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer ${activeTab === 'signup'
            ? 'bg-[#141414] text-white'
            : 'text-[#141414]/60 hover:bg-[#141414]/10'}`}>
            CREATE ACCOUNT
          </button>
        </div>

        {/* Validation Errors Overlay */}
        {errorMsg && (<div className="mb-4 p-3 bg-red-50 border border-red-250 text-red-800 text-xs rounded-none flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5"/>
            <span className="font-mono font-semibold text-[11px] leading-relaxed uppercase">{errorMsg}</span>
          </div>)}

        {/* Dynamic active screen options */}
        {activeTab === 'signin' ? (<form onSubmit={handleSignInSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                VERIFIED EMAIL REGISTRY
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                  <Mail className="w-4 h-4"/>
                </span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. nakulgharote@gmail.com" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]" required/>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider">
                  SECURITY KEYPASS
                </label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[9px] font-mono font-bold text-[#F27D26] hover:underline uppercase">
                  {showPassword ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                  <Lock className="w-4 h-4"/>
                </span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-10 py-2.5 outline-none font-mono" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#141414]/35 hover:text-[#141414]">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none shadow-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#141414]">
              {isSubmitting ? (<span>VERIFYING SECURE SHELL...</span>) : (<>
                  <span>CONFIRM SHELL SIGN IN</span>
                  <ArrowRight className="w-4 h-4"/>
                </>)}
            </button>
          </form>) : (<form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                ACCOUNT OWNER DISPLAY NAME
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                  <User className="w-4 h-4"/>
                </span>
                <input type="text" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} placeholder="e.g. Jordan Lee" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]" required/>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                REGISTRY EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                  <Mail className="w-4 h-4"/>
                </span>
                <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="e.g. yourname@domain.com" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]" required/>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                NEW ACCESS KEYPASS
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                  <Lock className="w-4 h-4"/>
                </span>
                <input type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-mono" required/>
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                ESTABLISH TARGET BUDGET AMOUNT (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#141414]/50 font-mono text-[11px] font-bold">
                  ₹
                </span>
                <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="e.g. 15000" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-8 pr-3.5 py-2.5 outline-none font-mono text-[#141414]" min="1" required/>
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                ESTABLISH STARTING EXPENDITURE / AGGREGATE COST (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#141414]/50 font-mono text-[11px] font-bold">
                  ₹
                </span>
                <input type="number" step="0.01" value={startingCost} onChange={(e) => setStartingCost(e.target.value)} placeholder="e.g. 12450.80" className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-8 pr-3.5 py-2.5 outline-none font-mono text-[#141414]" min="0" required/>
              </div>
            </div>

            {/* Plan Tier Check Box */}
            <div className="py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={signUpPremium} onChange={(e) => setSignUpPremium(e.target.checked)} className="rounded-none border border-[#141414] focus:ring-0 w-4 h-4 text-[#F27D26] cursor-pointer"/>
                <span className="text-[10px] font-mono font-bold text-[#141414]/80 uppercase tracking-wider">
                  Request PRIME_EXHIBIT corporate plan (FREE TRIAL)
                </span>
              </label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none shadow-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#141414]">
              {isSubmitting ? (<span>CREATING SECURE INDEX...</span>) : (<>
                  <span>CONFIRM UNIQUE LEDGER ENTRY</span>
                  <Check className="w-4 h-4"/>
                </>)}
            </button>
          </form>)}

        {false && (<div className="mt-6 pt-5 border-t border-[#141414]/10 bg-[#EBEBE4]/30 -mx-6 -mb-6 p-6">
          <p className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider mb-3 px-0.5">
            SECURE ACCESS: REGISTERED PROFILE PATHS
          </p>
          <div className="space-y-2">
            {PRESET_ACCOUNTS.map((account) => (<button key={account.email} onClick={() => handlePresetSelect(account)} disabled={isSubmitting} className="w-full text-left bg-white border border-[#141414]/30 hover:border-[#141414] hover:shadow-[2px_2px_0px_0px_#141414] p-2 px-3 rounded-none transition-all cursor-pointer flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="font-serif italic text-xs text-[#141414] font-semibold">{account.name}</p>
                  <p className="text-[9px] text-[#141414]/55 font-mono truncate">{account.email}</p>
                </div>
                <span className="text-[8px] font-mono shrink-0 px-2 py-0.5 bg-[#EBEBE4] text-[#141414]/70 uppercase tracking-wider border border-[#141414]/15 group-hover:bg-[#141414] group-hover:text-white transition-all">
                  {account.status} ➔
                </span>
              </button>))}
          </div>
        </div>)}

      </div>

      <div className="mt-8 text-center text-[10px] font-mono tracking-widest text-[#141414]/50 z-10">
        LEDGER SECURED BY AES-256 SYMMETRIC CELLULAR BLOCKCHAIN. ALL MATRIX ENTRIES INDEPENDENTLY AUDITED.
      </div>

    </div>);
}
