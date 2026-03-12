"use client";

import { motion } from "framer-motion";
import { Home, Search, Bell, Mail, User, Settings, PlusCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";

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
    const { user, signOut } = useAuth();

    return (
        <aside className="hidden sm:flex flex-col h-screen sticky top-0 py-6 px-4 lg:px-6 w-[88px] lg:w-[280px] border-r border-zinc-900 overflow-y-auto">
            <div className="mb-8 px-4">
                <Link href="/">
                    <Logo width={40} height={40} className="object-contain" />
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
                    href="/explore"
                    isActive={pathname === "/explore"}
                />
                <SidebarItem
                    icon={<Bell size={28} />}
                    label="Notifications"
                    href="/notifications"
                    isActive={pathname === "/notifications"}
                />
                <SidebarItem
                    icon={<Mail size={28} />}
                    label="Messages"
                    href="/messages"
                    isActive={pathname.startsWith("/messages")}
                />
                <SidebarItem
                    icon={<User size={28} />}
                    label="Profile"
                    href={`/profile/${user?.user_metadata?.username || user?.email?.split('@')[0] || "me"}`}
                    isActive={pathname.startsWith("/profile")}
                />
                <SidebarItem
                    icon={<Settings size={28} />}
                    label="Settings"
                    href="/settings"
                    isActive={pathname === "/settings"}
                />

                <motion.button
                    whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(248, 113, 113)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signOut()}
                    className="flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-zinc-500 font-medium"
                >
                    <LogOut size={28} />
                    <span className="text-xl hidden lg:block">Sair</span>
                </motion.button>

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
                        <p className="font-bold text-sm truncate">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-zinc-500 text-sm truncate">@{user?.user_metadata?.username || user?.email?.split('@')[0]}</p>
                    </div>
                </motion.button>
            </div>
        </aside>
    );
}
