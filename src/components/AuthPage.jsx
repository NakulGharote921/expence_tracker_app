/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseDb } from '../utils/supabaseDb';

export default function AuthPage({ initialMode = 'signin' }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data, error } = await supabaseDb.signUpEmail(email, password);
                if (error) throw error;
                // If email confirmation is enabled, Supabase returns a user without a session.
                if (data?.user && !data.session) {
                    setSuccess('Account created! Check your inbox to confirm your email, then sign in.');
                }
            } else {
                const { error } = await supabaseDb.signInEmail(email, password);
                if (error) throw error;
                // On success, route to the dashboard immediately.
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await supabaseDb.signInGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err?.message || 'Google sign-in failed.');
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-2xl">
                        W
                    </div>
                    <span className="font-serif text-3xl italic text-[#141414] tracking-tight">Wealth_Flow</span>
                    <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141414]/40">CURATED LEDGER</span>
                </div>

                <div className="bg-white border border-[#141414] shadow-[6px_6px_0px_0px_#F27D26] p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-serif text-2xl italic font-semibold">
                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </h1>
                        <div className="flex border border-[#141414]">
                            <button onClick={() => setMode('signin')} className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${mode === 'signin' ? 'bg-[#141414] text-white' : 'text-[#141414]'}`}>Sign in</button>
                            <button onClick={() => setMode('signup')} className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#141414] text-white' : 'text-[#141414]'}`}>Sign up</button>
                        </div>
                    </div>

                    {error && (<div className="mb-4 bg-red-50 border border-red-600 text-red-700 px-4 py-3 text-[10px] font-mono uppercase tracking-widest">{error}</div>)}
                    {success && (<div className="mb-4 bg-emerald-50 border border-emerald-600 text-emerald-700 px-4 py-3 text-[10px] font-mono uppercase tracking-widest">{success}</div>)}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-[#141414] px-3 py-2.5 text-sm outline-none focus:shadow-[2px_2px_0px_0px_#F27D26] bg-transparent"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-[#141414] px-3 py-2.5 text-sm outline-none focus:shadow-[2px_2px_0px_0px_#F27D26] bg-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#141414] text-white py-3 text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-[#F27D26] transition-all cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 border-t border-[#141414]/15" />
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#141414]/40">or</span>
                        <div className="flex-1 border-t border-[#141414]/15" />
                    </div>

                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full border border-[#141414] py-3 text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-[#141414] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                        Sign in with Google
                    </button>
                </div>

                <p className="mt-5 text-center text-[9px] font-mono uppercase tracking-widest text-[#141414]/40">
                    {mode === 'signin' ? 'No account?' : 'Already have an account?'} <button onClick={toggleMode} className="text-[#F27D26] underline cursor-pointer">{mode === 'signin' ? 'Create one' : 'Sign in'}</button>
                </p>
            </div>
        </div>
    );
}