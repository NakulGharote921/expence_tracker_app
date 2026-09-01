import { Link } from 'react-router-dom';

export default function AuthFailure() {
    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-white border-2 border-[#141414] mb-6">
                    <span className="text-2xl">!</span>
                </div>
                <h1 className="text-2xl font-bold">Google sign in failed</h1>
                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                    We could not complete the sign-in with Google. This can happen if you cancelled
                    the request or if the provider is temporarily unavailable.
                </p>
                <Link
                    to="/auth"
                    className="mt-6 inline-block w-full bg-[#141414] text-white py-3 text-sm font-mono uppercase tracking-widest hover:bg-[#F27D26]"
                >
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
