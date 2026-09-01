import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/appwrite/AuthProvider';

export default function ProtectedRoute({ children }) {
    const { user, loading, authStatus } = useAuth();

    if (loading || authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center font-sans">
                <span className="text-sm font-mono uppercase tracking-widest text-neutral-500">Loading...</span>
            </div>
        );
    }

    if (authStatus === 'logging_out') {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center font-sans">
                <span className="text-sm font-mono uppercase tracking-widest text-neutral-500">Signing out...</span>
            </div>
        );
    }

    if (!user || authStatus !== 'authenticated') {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
