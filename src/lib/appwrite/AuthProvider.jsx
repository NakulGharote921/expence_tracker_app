import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { OAuthProvider, AppwriteException } from 'appwrite';
import { account } from './client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState('loading');
    const logoutGenerationRef = useRef(0);

    const refresh = useCallback(async () => {
        if (localStorage.getItem('wf_is_logged_in') !== 'true') {
            setUser(null);
            setAuthStatus('unauthenticated');
            return null;
        }
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            setAuthStatus('authenticated');
            return currentUser;
        } catch (err) {
            if (err?.response?.status === 401 || err?.code === 401) {
                localStorage.removeItem('wf_is_logged_in');
            }
            setUser(null);
            setAuthStatus('unauthenticated');
            return null;
        }
    }, []);

    useEffect(() => {
        refresh().finally(() => setLoading(false));
    }, [refresh]);

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

    const signOut = useCallback(async () => {
        setAuthStatus('logging_out');
        logoutGenerationRef.current += 1;
        try {
            await account.deleteSession({ sessionId: 'current' });
        } catch (_) {
            // Session may already be invalid — continue with local cleanup.
        }
        localStorage.removeItem('wf_is_logged_in');
        setUser(null);
        setAuthStatus('unauthenticated');
    }, []);

    const value = {
        client: account,
        user,
        loading,
        authStatus,
        refresh,
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

export { AppwriteException };
