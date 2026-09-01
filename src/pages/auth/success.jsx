import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite/client';

export default function AuthSuccess() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const url = new URL(window.location.href);
        const secret = url.searchParams.get('secret');
        const userId = url.searchParams.get('userId');

        if (!secret || !userId) {
            setError('Missing OAuth credentials.');
            return;
        }

        (async () => {
            try {
                await account.createSession({ userId, secret });
                window.location.assign(`${window.location.origin}/dashboard`);
            } catch (err) {
                setError(err?.message || 'Could not complete sign in.');
            }
        })();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md text-center">
                {error ? (
                    <>
                        <h1 className="text-2xl font-bold">Sign in failed</h1>
                        <p className="text-sm text-red-600 mt-3">{error}</p>
                        <button
                            onClick={() => window.location.assign(`${window.location.origin}/auth`)}
                            className="mt-6 w-full bg-[#141414] text-white py-3 text-sm font-mono uppercase tracking-widest hover:bg-[#F27D26]"
                        >
                            Back to sign in
                        </button>
                    </>
                ) : (
                    <>
                        <div className="inline-flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-white border-2 border-[#141414] mb-6">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h1 className="text-2xl font-bold">Signing you in...</h1>
                    </>
                )}
            </div>
        </div>
    );
}
