/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import NotFound from './pages/NotFound';

function AppRoutes() {
    const { session, loading } = useAuth();
    const authenticated = Boolean(session);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center font-sans">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/50">Loading ledger...</span>
            </div>
        );
    }

    return (
        <Routes>
            {authenticated ? (
                <>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/register" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Dashboard />} />
                        <Route path="/subscriptions" element={<Dashboard />} />
                        <Route path="/budgets" element={<Dashboard />} />
                        <Route path="/categories" element={<Dashboard />} />
                        <Route path="/reports" element={<Dashboard />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </>
            ) : (
                <>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<AuthPage initialMode="signin" />} />
                    <Route path="/register" element={<AuthPage initialMode="signup" />} />

                    <Route path="/dashboard" element={<Navigate to="/login" replace />} />
                    <Route path="/transactions" element={<Navigate to="/login" replace />} />
                    <Route path="/subscriptions" element={<Navigate to="/login" replace />} />
                    <Route path="/budgets" element={<Navigate to="/login" replace />} />
                    <Route path="/categories" element={<Navigate to="/login" replace />} />
                    <Route path="/reports" element={<Navigate to="/login" replace />} />

                    <Route path="*" element={<NotFound />} />
                </>
            )}
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}