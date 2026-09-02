/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center font-sans">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/50">Loading ledger...</span>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}