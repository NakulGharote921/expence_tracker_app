/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabaseDb } from '../utils/supabaseDb';

const AuthContext = createContext(null);

// Derive a display name from the authenticated Supabase user's metadata.
function resolveDisplayName(user) {
    if (!user) return '';
    const meta = user.user_metadata || {};
    return (
        meta.full_name ||
        meta.name ||
        meta.display_name ||
        user.email?.split('@')[0] ||
        ''
    );
}

// Derive an avatar URL from the authenticated Supabase user's metadata.
function resolveAvatarUrl(user) {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return meta.avatar_url || meta.picture || null;
}

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
            // Setting the session to null (logout) or the new session (login/switch)
            // automatically clears/repopulates derived profile fields below.
            if (mounted) setSession(currentSession);
        });

        return () => {
            mounted = false;
            subscription?.subscription?.unsubscribe?.();
        };
    }, []);

    const user = session?.user ?? null;
    const email = user?.email ?? '';
    const displayName = resolveDisplayName(user);
    const avatarUrl = resolveAvatarUrl(user);

    // Persist a new display name into Supabase auth user metadata and refresh
    // the local user state so the UI updates immediately.
    const updateUser = useCallback(async (meta) => {
        const { data, error } = await supabaseDb.updateUserMeta(meta);
        if (error) return { error };
        if (data?.user) setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
        return { data, error };
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, loading, email, displayName, avatarUrl, updateUser }}>
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