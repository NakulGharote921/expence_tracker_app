import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { OAuthProvider, ID } from 'appwrite';
import { account } from './client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState('loading');
    const logoutGenerationRef = useRef(0);

    // ── Session init ────────────────────────────────────────────────────
    useEffect(() => {
        console.log('[AUTH] Initializing session');
        let cancelled = false;
        (async () => {
            try {
                const currentUser = await account.get();
                if (cancelled) return;
                console.log('[AUTH] User authenticated:', currentUser.$id);
                setUser(currentUser);
                setAuthStatus('authenticated');
            } catch {
                if (cancelled) return;
                console.log('[AUTH] No active session');
                setUser(null);
                setAuthStatus('unauthenticated');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Sign in with email/password ─────────────────────────────────────
    const signInWithEmail = useCallback(async (email, password) => {
        await account.createEmailPasswordSession(email, password);
        const authenticatedUser = await account.get();
        console.log('[AUTH] Login successful:', authenticatedUser.$id);
        setUser(authenticatedUser);
        setAuthStatus('authenticated');
        return authenticatedUser;
    }, []);

    // ── Create account ──────────────────────────────────────────────────
    const createAccount = useCallback(async ({ name, email, password }) => {
        await account.create(ID.unique(), email, password, name.trim());
        await account.createEmailPasswordSession(email, password);
        const authenticatedUser = await account.get();
        console.log('[AUTH] Account created & session started:', authenticatedUser.$id);
        setUser(authenticatedUser);
        setAuthStatus('authenticated');
        return authenticatedUser;
    }, []);

    // ── Google OAuth ────────────────────────────────────────────────────
    const signInWithGoogle = useCallback(async () => {
        const success = `${window.location.origin}/auth/success`;
        const failure = `${window.location.origin}/auth/failure`;
        const url = await account.createOAuth2Token({
            provider: OAuthProvider.Google,
            success,
            failure,
        });
        if (url && typeof url === 'string') {
            window.location.assign(url);
        }
    }, []);

    // ── Logout ──────────────────────────────────────────────────────────
    const signOut = useCallback(async () => {
        console.log('[AUTH] Logout started');
        setAuthStatus('logging_out');
        logoutGenerationRef.current += 1;
        try {
            await account.deleteSession({ sessionId: 'current' });
        } catch {
            // Session may already be invalid — continue with local cleanup.
        }
        setUser(null);
        setAuthStatus('unauthenticated');
        console.log('[AUTH] Logout completed');
    }, []);

    const value = {
        client: account,
        user,
        loading,
        authStatus,
        signInWithEmail,
        createAccount,
        signInWithGoogle,
        signOut,
        isAuthenticated: authStatus === 'authenticated',
        logoutGeneration: logoutGenerationRef,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
