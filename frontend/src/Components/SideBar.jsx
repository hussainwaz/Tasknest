import React, { useEffect, useState } from "react";
import { LayoutDashboard, Settings2, Trash2, Notebook, ClipboardList, LogOut, FlaskConical } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
export default function SideBar({ isOpen }) {

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard />, path: "/" },
        { label: "Tasks", icon: <ClipboardList />, path: "/tasks" },
        { label: "Notes", icon: <Notebook />, path: "/notes" },
        { label: "Settings", icon: <Settings2 />, path: "/settings" },
    ];


    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const index = navItems.findIndex((item) => item.path === location.pathname);
        setActiveIndex(index !== -1 ? index : 0);
    }, [location.pathname]);

    return (
        <div className={`h-full bg-[#000000] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isOpen ? 'fixed top-0 left-0 w-[80vw] sm:w-[50vw] md:w-full z-50 md:static ' : 'fixed top-0 left-0 w-[80vw] md:w-full z-50 md:translate-x-0 md:'}`}>
            <div className=" w-full h-full flex flex-col px-2 pb-3">
                <div className="w-full h-[10%] flex justify-center items-center bg-[#000000]">
                    <img src="/logo.svg" alt="" width={170} className="hover:scale-105 cursor-pointer transition-all duration-500" />
                </div>

                {/* menu options */}
                <div className="relative pt-7 px-3 bg-[#121212] flex flex-col flex-grow gap-3 rounded-2xl">
                    <span
                        className=" transform transition-transform duration-500 ease-in-out absolute left-[13px] top-[35px] z-10 w-[5px] h-[35px] bg-[#a0eadeff] rounded-xl"
                        style={{
                            transform: `translateY(${activeIndex * 60}px)`,
                        }}
                    ></span>

                    {navItems.map((item, index) => (
                        <NavLink
                            to={item.path}
                            key={item.label}
                            className={({ isActive }) =>
                                `relative flex gap-3 p-3 pl-5 text-[#fffbfeff] bg-[#11181f] rounded-[8px] cursor-pointer ${isActive ? "bg-[#13293dff]" : ""}`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                    <div className="mt-auto p-4 text-center text-white">
                        <div className="flex justify-center items-center gap-2 text-sm text-[#a0eadeff] animate-bounce">
                            <span className="text-xl animate-ping"><FlaskConical/></span>
                            <span>Beta in progress</span>
                        </div>
                        <div className="text-xs text-gray-300 animate-pulse mt-1">Stuff might break.<br/>Features may vanish.<br/>Magic is still being forged.</div>
                    </div>
                </div>

            </div>
        </div>
    )
};