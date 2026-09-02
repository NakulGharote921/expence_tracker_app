import { useEffect, useState } from 'react';
import { supabaseDb } from './utils/supabaseDb';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';

export default function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        supabaseDb.getSession().then(({ data }) => {
            if (mounted) {
                setSession(data.session);
                setLoading(false);
            }
        });

        const { data: subscription } = supabaseDb.onAuthStateChange((_event, currentSession) => {
            if (mounted) setSession(currentSession);
        });

        return () => {
            mounted = false;
            subscription?.subscription?.unsubscribe?.();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] text-[#141414] flex items-center justify-center font-sans">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/50">Loading ledger...</span>
            </div>
        );
    }

    return session ? <Dashboard userId={session.user.id} /> : <AuthPage />;
}