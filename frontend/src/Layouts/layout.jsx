import { Outlet } from 'react-router-dom';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { useEffect, useState } from 'react';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="relative flex h-[100dvh] w-full overflow-hidden">
            <div className="absolute inset-0" aria-hidden="true">
                <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(150% 90% at 0% 0%, rgba(109,141,255,0.18) 0%, transparent 58%)" }} />
                <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(120% 80% at 100% 100%, rgba(87,214,255,0.18) 0%, transparent 60%)" }} />
            </div>

            <div className="relative flex h-full w-full max-w-[1640px] mx-auto px-[10px]">
                {!isMobile && (
                    <div className="hidden md:flex w-[250px] xl:w-[280px] py-5 pr-[10px]">
                        <div className="w-full surface-blur rounded-[28px] h-full overflow-hidden">
                            <SideBar isOpen={true} />
                        </div>
                    </div>
                )}

                {isMobile && isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-[rgba(6,9,15,0.82)] backdrop-blur-md" onClick={toggleMobileMenu} />
                )}

                {isMobile && (
                    <div className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] p-[10px] transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="surface-blur h-full rounded-[28px] overflow-hidden">
                            <SideBar isOpen={isMobileMenuOpen} />
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col py-5">
                    <div className="surface-blur rounded-[28px] border border-[rgba(255,255,255,0.04)] h-full flex flex-col overflow-hidden">
                        <NavBar menuToggle={toggleMobileMenu} isItMobile={isMobile} />
                        <main className="flex-1 overflow-y-auto custom-scrollbar">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;