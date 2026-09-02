/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabaseDb } from '../utils/supabaseDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

    const user = session?.user ?? null;

    return (
        <AuthContext.Provider value={{ session, user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}