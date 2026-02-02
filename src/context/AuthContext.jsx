import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { AuthContext, useAuth } from './useAuth';
export { useAuth };
// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const idleTimerRef = useRef(null);

    const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute

    // --- Logout logic ---
    const logout = useCallback(() => {
        console.warn('[AuthContext] Session expired or unauthorized access detect - logging out');
        authService.logout();
        setUser(null);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }, []);

    // --- Reset idle timer ---
    const resetTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Only set timer if there is a token (user is logged in)
        if (localStorage.getItem('token')) {
            idleTimerRef.current = setTimeout(() => {
                console.warn('[AuthContext] Session expired due to inactivity');
                logout();
            }, INACTIVITY_TIMEOUT);
        }
    }, [logout]);

    // --- Initial Auth Check ---
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                    resetTimer(); // Start timer if already logged in
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();

        // Global Event listeners
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => resetTimer();

        activityEvents.forEach(event => window.addEventListener(event, handleActivity));
        window.addEventListener('auth-unauthorized', logout);

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
            window.removeEventListener('auth-unauthorized', logout);
        };
    }, [logout, resetTimer]);

    // Reset timer whenever user state changes (e.g. after login)
    useEffect(() => {
        if (user) {
            resetTimer();
        }
    }, [user, resetTimer]);


    // Login function
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    };

    const signup = async (username, email, password, role) => {
        return await authService.signup(username, email, password, role);
    };

    const switchMode = async (mode) => {
        const data = await authService.switchMode(mode);
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, switchMode }}>
            {children}
        </AuthContext.Provider>
    );
};
