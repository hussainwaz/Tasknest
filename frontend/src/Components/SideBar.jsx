import React from "react";
import { LayoutDashboard, Settings2, Notebook, ClipboardList, Sparkles, Target } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
    { label: "Overview", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, path: "/" },
    { label: "Tasks", icon: <ClipboardList className="h-[18px] w-[18px]" />, path: "/tasks" },
    { label: "Notes", icon: <Notebook className="h-[18px] w-[18px]" />, path: "/notes" },
    { label: "Settings", icon: <Settings2 className="h-[18px] w-[18px]" />, path: "/settings" },
];

export default function SideBar({ isOpen }) {
    return (
        <aside className={`flex h-full flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} transition-transform duration-300 ease-out`}>
            <div className="flex flex-col gap-6 px-[10px] py-5">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(109,141,255,0.18)] text-gradient">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="font-semibold tracking-tight text-lg">Tasknest</h1>
                            <p className="text-xs text-[rgba(197,208,245,0.72)]">Focus, organise, thrive.</p>
                        </div>
                    </div>
                    <div className="glass-divider"></div>
                </div>

                <nav className="flex flex-col gap-2 text-sm">
                    {navItems.map(({ label, icon, path }) => (
                        <NavLink
                            key={label}
                            to={path}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${isActive
                                    ? "bg-[rgba(109,141,255,0.14)] border border-[rgba(109,141,255,0.3)] shadow-[0_12px_25px_rgba(16,24,38,0.36)] text-white"
                                    : "border border-transparent hover:border-[rgba(109,141,255,0.18)] hover:bg-[rgba(109,141,255,0.08)] text-[rgba(197,208,245,0.8)]"
                                }`
                            }
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] group-hover:bg-[rgba(255,255,255,0.08)]">
                                {icon}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-medium tracking-wide">{label}</span>
                                {label === "Overview" && (
                                    <span className="text-[11px] text-[rgba(197,208,245,0.58)]">Pulse of your workspace</span>
                                )}
                            </div>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-4">
                    <div className="rounded-2xl border border-[rgba(109,141,255,0.22)] bg-[rgba(255,255,255,0.04)] p-4">
                        <div className="flex items-start gap-3">
                            <span className="rounded-full bg-[rgba(87,214,255,0.2)] p-2 text-accent-secondary">
                                <Target className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-sm font-medium">Quick tip</p>
                                <p className="text-xs text-[rgba(197,208,245,0.7)]">Pin tasks and notes to keep them visible on the dashboard.</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-[rgba(197,208,245,0.52)]">
                        Crafted with intent — keep focusing on the meaningful work.
                    </p>
                </div>
            </div>
        </aside>
    );
}