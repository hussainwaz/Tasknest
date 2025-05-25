import { Outlet } from 'react-router-dom';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { useEffect, useState } from 'react';

const Layout = ({ children }) => {
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
        <div className="flex h-[100dvh] w-full bg-black">
            {/* Desktop Sidebar - part of main flex layout */}
            {!isMobile && (
                <div className="w-64 bg-black h-full flex-shrink-0">
                    <SideBar isOpen={true} />
                </div>
            )}

            {/* Mobile Sidebar - overlay */}
            {isMobile && isMobileMenuOpen && (
                <div className='fixed inset-0 bg-black/50 z-40 md:hidden'
                    onClick={toggleMobileMenu}>
                </div>
            )}
            {isMobile && (
                <SideBar isOpen={isMobileMenuOpen} />
            )}

            {/* Main content area with navbar */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <NavBar menuToggle={toggleMobileMenu} isItMobile={isMobile} />
                
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;