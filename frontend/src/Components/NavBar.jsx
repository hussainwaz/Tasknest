import React, { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut, Menu, Search, UserRoundPlus, Sun, Sparkles, User } from "lucide-react";
import AuthModal from "./AuthModal";
import { useData } from "../DataContext";

export default function NavBar({ menuToggle, isItMobile }) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin');

    // Get user state from context instead of local state
    const { userId, isGuest, setIsGuest, setUserId } = useData();

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    useEffect(() => {
        const checkAuth = () => {
            const user_id = localStorage.getItem("user_id");
            if (user_id) {
                setUserId(user_id);
                setIsGuest(false);
            } else {
                setIsGuest(true);
                setUserId(null);
            }
        };

        checkAuth(); // initial check

        window.addEventListener("userLoggedIn", checkAuth);
        return () => {
            window.removeEventListener("userLoggedIn", checkAuth);
        };
    }, [setUserId, setIsGuest]); // Add context setters to dependencies

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        setUserId(null);
        setIsGuest(true);
        window.dispatchEvent(new Event("userLoggedOut"));
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const initials = useMemo(() => {
        if (!userId) return "TN";
        return `TN-${String(userId).slice(-2)}`;
    }, [userId]);

    return (
        <>
            <header className="relative flex flex-col gap-4 border-b border-[rgba(255,255,255,0.05)] px-[10px] py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">
                <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-start">
                    <div className="flex items-center gap-3 md:gap-5">
                        <button
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-white transition md:hidden"
                            onClick={menuToggle}
                            aria-label="Toggle navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col">
                            <span className="pill text-[11px] uppercase tracking-[0.24em] text-[rgba(197,208,245,0.72)]">
                                {greeting}
                            </span>
                            <h2 className="mt-2 text-lg font-semibold md:text-xl">
                                Your organised day starts now
                            </h2>
                        </div>
                    </div>
                </div>

                {!isItMobile && (
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        <div className="relative flex w-full max-w-[360px] items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[rgba(197,208,245,0.72)]">
                            <Search className="h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search tasks, notes or keywords"
                                className="w-full bg-transparent text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none"
                            />
                            <span className="rounded-lg whitespace-nowrap bg-[rgba(109,141,255,0.16)] px-2 py-1 text-[10px] uppercase tracking-wide text-[rgba(197,208,245,0.8)]">
                                Ctrl + K
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex w-full items-center justify-end gap-2 md:w-auto md:gap-4">
                    <div className="glass-divider hidden md:block h-8 w-px" aria-hidden="true"></div>

                    <div className="flex items-center gap-1">
                        {isGuest ? (
                            <>
                                <button
                                    className="shadow-ring rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide whitespace-nowrap text-white/90"
                                    onClick={() => handleAuthClick('signin')}
                                >
                                    Sign in
                                </button>
                                <button
                                    className="rounded-full whitespace-nowrap bg-gradient-to-r from-[rgba(109,141,255,0.75)] to-[rgba(87,214,255,0.75)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black"
                                    onClick={() => handleAuthClick('signup')}
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="rounded-full bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[rgba(255,255,255,0.12)]"
                            >
                                Logout
                            </button>
                        )}

                        <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(109,141,255,0.66)] via-[rgba(87,214,255,0.52)] to-[rgba(46,41,78,0.86)] text-[11px]">
                                {isGuest ? <User className="h-5 w-5 text-white/80" /> : <span>{initials}</span>}
                            </div>

                            {!isGuest && (
                                <span className="absolute bottom-0 right-0 flex h-4 w-4 translate-x-1 translate-y-1 items-center justify-center rounded-full bg-[rgba(87,214,255,0.9)] text-[rgba(4,7,13,0.85)]">
                                    <Sparkles className="h-3 w-3" />
                                </span>
                            )}
                        </div>

                    </div>
                </div>
            </header>

            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
                />
            )}
        </>
    );
}