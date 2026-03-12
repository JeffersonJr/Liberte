"use client";

import { motion } from "framer-motion";
import { Home, Search, Bell, Mail, User, Settings, PlusCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    isActive?: boolean;
}

function SidebarItem({ icon, label, href, isActive }: SidebarItemProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${isActive ? "text-zinc-100 font-bold" : "text-zinc-400 font-medium"
                    }`}
            >
                <div className={isActive ? "text-zinc-100" : "text-zinc-500"}>
                    {icon}
                </div>
                <span className="text-xl hidden lg:block">{label}</span>
            </motion.div>
        </Link>
    );
}

export function Sidebar({ onCompose }: { onCompose: () => void }) {
    const pathname = usePathname();

    return (
        <aside className="hidden sm:flex flex-col h-screen sticky top-0 py-6 px-4 lg:px-6 w-[88px] lg:w-[280px] border-r border-zinc-900 overflow-y-auto">
            <div className="mb-8 px-4">
                <Link href="/">
                    <img src="/logo.png" alt="Liberté" className="w-10 h-10 object-contain" />
                </Link>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                <SidebarItem
                    icon={<Home size={28} />}
                    label="Home"
                    href="/"
                    isActive={pathname === "/"}
                />
                <SidebarItem
                    icon={<Search size={28} />}
                    label="Explore"
                    href="#"
                />
                <SidebarItem
                    icon={<Bell size={28} />}
                    label="Notifications"
                    href="#"
                />
                <SidebarItem
                    icon={<Mail size={28} />}
                    label="Messages"
                    href="#"
                />
                <SidebarItem
                    icon={<User size={28} />}
                    label="Profile"
                    href="#"
                />
                <SidebarItem
                    icon={<Settings size={28} />}
                    label="Settings"
                    href="/settings"
                    isActive={pathname === "/settings"}
                />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCompose}
                    className="mt-4 bg-zinc-100 text-black rounded-full h-14 flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-white transition-all overflow-hidden"
                >
                    <PlusCircle size={24} className="flex-shrink-0" />
                    <span className="text-lg hidden lg:block">Publish</span>
                </motion.button>
            </div>

            <div className="mt-auto">
                <motion.button
                    whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                    className="flex items-center gap-3 w-full p-3 rounded-full transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex-shrink-0" />
                    <div className="hidden lg:block text-left flex-grow min-w-0">
                        <p className="font-bold text-sm truncate">Vitor Liberté</p>
                        <p className="text-zinc-500 text-sm truncate">@vitor.liberte</p>
                    </div>
                    <MoreHorizontal size={20} className="text-zinc-500 hidden lg:block" />
                </motion.button>
            </div>
        </aside>
    );
}
