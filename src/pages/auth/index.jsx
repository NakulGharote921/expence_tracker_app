import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/appwrite/AuthProvider';

function GoogleIcon({ className }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z"
                fill="#C4C6D7"
            />
        </svg>
    );
}

export default function AuthPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [starting, setStarting] = useState(false);

    const handleGoogle = async (e) => {
        e.preventDefault();
        setError('');
        setStarting(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err?.message || 'Unable to start Google sign in.');
            setStarting(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold tracking-tight">Wealth Flow</h1>
                <p className="text-sm text-neutral-500 mt-2 mb-8">Sign in to continue to your secure ledger</p>

                <div className="bg-white border border-neutral-200 p-8 shadow-[4px_4px_0px_0px_#141414]">
                    <button
                        onClick={handleGoogle}
                        disabled={starting}
                        className="w-full flex items-center justify-center gap-3 bg-[#141414] text-white py-3 text-sm font-mono uppercase tracking-widest hover:bg-[#F27D26] disabled:opacity-50"
                    >
                        <GoogleIcon />
                        {starting ? 'Connecting...' : 'Sign in with Google'}
                    </button>

                    {error && <p className="text-xs text-red-600 mt-4">{error}</p>}
                </div>

                <p className="text-xs text-neutral-500 mt-6">
                    Google OAuth is managed by Appwrite. No credentials are stored in this app.
                </p>
            </div>
        </div>
    );
}
