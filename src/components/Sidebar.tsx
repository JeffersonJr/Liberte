"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Bell, Mail, User, Settings, PlusCircle, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
                whileHover={{ backgroundColor: "var(--foreground-rgb-01)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${isActive ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                    }`}
            >
                <div className={isActive ? "text-foreground" : "text-muted-foreground"}>
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
        <aside className="hidden sm:flex flex-col h-screen sticky top-0 py-6 px-4 lg:px-6 w-[88px] lg:w-[280px] border-r border-border overflow-y-auto bg-background">
            <div className="mb-8 px-4">
                <Link href="/">
                    <Logo width={140} height={40} className="object-contain" />
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

                <ThemeToggle />

                <motion.button
                    whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(248, 113, 113)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signOut()}
                    className="flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-muted-foreground font-medium"
                >
                    <LogOut size={28} />
                    <span className="text-xl hidden lg:block">Sair</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCompose}
                    className="mt-4 bg-foreground text-background rounded-full h-14 flex items-center justify-center gap-2 font-bold shadow-lg hover:opacity-90 transition-all overflow-hidden"
                >
                    <PlusCircle size={24} className="flex-shrink-0" />
                    <span className="text-lg hidden lg:block">Publish</span>
                </motion.button>
            </div>

            <div className="mt-auto">
                <motion.button
                    whileHover={{ backgroundColor: "var(--foreground-rgb-01)" }}
                    className="flex items-center gap-3 w-full p-3 rounded-full transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex-shrink-0" />
                    <div className="hidden lg:block text-left flex-grow min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-muted-foreground text-sm truncate">@{user?.user_metadata?.username || user?.email?.split('@')[0]}</p>
                    </div>
                </motion.button>
            </div>
        </aside>
    );
}
function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <motion.button
            whileHover={{ backgroundColor: "var(--foreground-rgb-01)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-muted-foreground font-medium w-full text-left"
        >
            <div className="relative w-7 h-7 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span className="text-xl hidden lg:block">
                {isDark ? "Dark Mode" : "Light Mode"}
            </span>
        </motion.button>
    );
}
