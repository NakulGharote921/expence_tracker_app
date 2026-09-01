import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/appwrite/AuthProvider';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
    );
}

function mapAppwriteError(err) {
    const status = err?.response?.status || err?.code;
    const message = err?.response?.message || err?.message || '';
    if (status === 401 || /invalid.*credentials|wrong.*password|unauthorized/i.test(message)) {
        return 'Invalid email or password.';
    }
    if (status === 409 || /already.*exists|user_already_exists/i.test(message)) {
        return 'An account with this email already exists. Please sign in instead.';
    }
    if (status === 403) {
        return 'Permission denied. Please check your account settings.';
    }
    if (status === 400 && /password/i.test(message)) {
        return 'Password does not meet requirements. Check minimum length.';
    }
    if (status === 400) {
        return `Invalid input: ${message}`;
    }
    return message || 'Something went wrong. Please try again.';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
    const { user, loading, signInWithEmail, createAccount, signInWithGoogle } = useAuth();

    const [activeTab, setActiveTab] = useState('signin');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Sign-in fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Sign-up fields
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpPhone, setSignUpPhone] = useState('');
    const [signUpCurrency, setSignUpCurrency] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center font-sans">
                <span className="text-sm font-mono uppercase tracking-widest text-neutral-500">Loading...</span>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrorMsg('');
        setShowPassword(false);
    };

    /* ───── Sign In ───── */
    const handleSignIn = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email.trim()) {
            setErrorMsg('Email is required.');
            return;
        }
        if (!EMAIL_RE.test(email.trim())) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        if (!password) {
            setErrorMsg('Password is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signInWithEmail(email.trim(), password);
        } catch (err) {
            setErrorMsg(mapAppwriteError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ───── Create Account ───── */
    const handleSignUp = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const name = signUpName.trim();
        const acctEmail = signUpEmail.trim();

        if (!name) {
            setErrorMsg('Name is required.');
            return;
        }
        if (!acctEmail) {
            setErrorMsg('Email is required.');
            return;
        }
        if (!EMAIL_RE.test(acctEmail)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        if (!signUpPassword) {
            setErrorMsg('Password is required.');
            return;
        }
        if (signUpPassword.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createAccount({
                name,
                email: acctEmail,
                password: signUpPassword,
                phone: signUpPhone.trim() || undefined,
                currency: signUpCurrency.trim() || undefined,
            });
        } catch (err) {
            setErrorMsg(mapAppwriteError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ───── Google ───── */
    const handleGoogle = async () => {
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setErrorMsg(mapAppwriteError(err));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex flex-col items-center justify-center p-4 select-none font-sans relative overflow-hidden">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            {/* Brand header */}
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

            {/* Card */}
            <div className="w-full max-w-md bg-white border-2 border-[#141414] rounded-none shadow-[8px_8px_0px_0px_#141414] p-6 relative z-10 animate-[scale-up_0.25s_ease-out]">

                {/* Tab selector */}
                <div className="flex bg-[#EBEBE4] p-1 border border-[#141414] rounded-none mb-6">
                    <button
                        onClick={() => switchTab('signin')}
                        className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                            activeTab === 'signin'
                                ? 'bg-[#141414] text-white'
                                : 'text-[#141414]/60 hover:bg-[#141414]/10'
                        }`}
                    >
                        SIGN IN
                    </button>
                    <button
                        onClick={() => switchTab('signup')}
                        className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                            activeTab === 'signup'
                                ? 'bg-[#141414] text-white'
                                : 'text-[#141414]/60 hover:bg-[#141414]/10'
                        }`}
                    >
                        CREATE ACCOUNT
                    </button>
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-250 text-red-800 text-xs rounded-none flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="font-mono font-semibold text-[11px] leading-relaxed uppercase">{errorMsg}</span>
                    </div>
                )}

                {/* ───── SIGN IN FORM ───── */}
                {activeTab === 'signin' && (
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                VERIFIED EMAIL REGISTRY
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. nakulgharote@gmail.com"
                                    className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-0.5">
                                <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider">
                                    SECURITY KEYPASS
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[9px] font-mono font-bold text-[#F27D26] hover:underline uppercase"
                                >
                                    {showPassword ? 'Hide Key' : 'Reveal Key'}
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-10 py-2.5 outline-none font-mono"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#141414]/35 hover:text-[#141414]"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none shadow-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#141414] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span>SIGNING IN...</span>
                            ) : (
                                <>
                                    <span>CONFIRM SHELL SIGN IN</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* ───── CREATE ACCOUNT FORM ───── */}
                {activeTab === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                ACCOUNT OWNER DISPLAY NAME
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                                    <User className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={signUpName}
                                    onChange={(e) => setSignUpName(e.target.value)}
                                    placeholder="e.g. Jordan Lee"
                                    className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                REGISTRY EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    value={signUpEmail}
                                    onChange={(e) => setSignUpEmail(e.target.value)}
                                    placeholder="e.g. yourname@domain.com"
                                    className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-3.5 py-2.5 outline-none font-sans text-[#141414]"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                NEW ACCESS KEYPASS
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/40">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={signUpPassword}
                                    onChange={(e) => setSignUpPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-9 pr-10 py-2.5 outline-none font-mono"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#141414]/35 hover:text-[#141414]"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                MOBILE NUMBER <span className="text-[#141414]/30">(OPTIONAL)</span>
                            </label>
                            <input
                                type="tel"
                                value={signUpPhone}
                                onChange={(e) => setSignUpPhone(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none px-3.5 py-2.5 outline-none font-sans text-[#141414]"
                                autoComplete="tel"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-wider px-0.5">
                                CURRENCY <span className="text-[#141414]/30">(OPTIONAL)</span>
                            </label>
                            <input
                                type="text"
                                value={signUpCurrency}
                                onChange={(e) => setSignUpCurrency(e.target.value)}
                                placeholder="e.g. INR"
                                className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none px-3.5 py-2.5 outline-none font-sans text-[#141414]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none shadow-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#141414] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span>CREATING ACCOUNT...</span>
                            ) : (
                                <>
                                    <span>CONFIRM UNIQUE LEDGER ENTRY</span>
                                    <span className="text-sm">✓</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#141414]/15" />
                    <span className="text-[9px] font-mono font-bold text-[#141414]/50 uppercase tracking-widest">or continue with</span>
                    <div className="flex-1 h-px bg-[#141414]/15" />
                </div>

                {/* Google */}
                <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isSubmitting}
                    className="w-full border-2 border-[#141414] bg-white hover:bg-[#F5F5F0] text-[#141414] font-mono font-bold uppercase tracking-widest text-[11px] py-3 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_0px_#141414] hover:shadow-[2px_2px_0px_0px_#141414] active:scale-99 disabled:opacity-50"
                >
                    <GoogleIcon />
                    {isSubmitting ? <span>CONNECTING...</span> : <span>SIGN IN WITH GOOGLE</span>}
                </button>
            </div>

            <div className="mt-8 text-center text-[10px] font-mono tracking-widest text-[#141414]/50 z-10">
                LEDGER SECURED BY AES-256 SYMMETRIC CELLULAR BLOCKCHAIN. ALL MATRIX ENTRIES INDEPENDENTLY AUDITED.
            </div>
        </div>
    );
}
