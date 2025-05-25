import React, { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, Search, UserRoundPlus } from "lucide-react"
import AuthModal from "./AuthModal";
export default function NavBar({ menuToggle, isItMobile }) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin');

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };
    const [userId, setUserId] = useState(null);
    const [isGuest, setIsGuest] = useState(false);

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
}, []);

    const handleLogout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
    setIsGuest(true);
    window.dispatchEvent(new Event("userLoggedOut")); // optional
}

    return (
        <>
            <div className="h-[10vh] w-full py-4 md:h-[10vh] bg-[#000000] text-white">
                <div className="w-full h-full flex justify-between md:justify-end items-center px-4 md:px-11 gap-3">
                    <div className="cursor-pointer md:hidden"
                        onClick={menuToggle}
                    >
                        <Menu className="scale-125" />
                    </div>

                    <div className="cursor-pointer md:hidden"
                    >
                        <img src="/logo.svg" alt="" width={170} className="hover:scale-105 cursor-pointer transition-all duration-500" />
                    </div>

                    <div>
                        {isItMobile && isGuest && (
                            <div className="flex gap-9 text-[16px] font-medium">
                                <LogIn className="scale-110" onClick={() => handleAuthClick('signin')} />
                                <UserRoundPlus className="scale-110" onClick={() => handleAuthClick('signup')} />
                            </div>
                        )}
                        {isItMobile && !isGuest && (
                            <div className="flex gap-9 text-[16px] font-medium">
                                <LogOut className="scale-110" onClick={handleLogout} />
                            </div>
                        )}
                        {!isItMobile && isGuest && (
                            <div className="flex gap-3 text-[16px] font-medium">
                                <button className="bg-[#fffbfeff] text-black py-[9px] px-6 rounded-[8px] border-2 border-transparent hover:border-white cursor-pointer hover:bg-black hover:text-white transition-all duration-500" onClick={() => handleAuthClick('signin')}>Signin</button>
                                <button className="bg-[#13293dff] text-white py-[9px] px-6 rounded-[8px] border-2 border-transparent hover:border-[#13293dff] cursor-pointer transition-all duration-500 hover:bg-black hover:text-white" onClick={() => handleAuthClick('signup')}>Signup</button>
                            </div>
                        )}
                        {!isItMobile && !isGuest && (
                            <div className="flex gap-3 text-[16px] font-medium">
                                <button className="bg-[#fffbfeff] text-black py-[9px] px-6 rounded-[8px] border-2 border-transparent hover:border-white cursor-pointer hover:bg-black hover:text-white transition-all duration-500" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
                />
            )}
        </>
    )
};