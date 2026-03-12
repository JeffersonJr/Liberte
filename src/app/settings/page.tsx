"use client";

import { motion } from "framer-motion";
import { ChevronLeft, User, Shield, Bell, Eye, LogOut } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-xl border-x border-zinc-900 min-h-screen">
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="sm:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-serif text-2xl font-bold tracking-tighter">Settings</h1>
                </header>

                <div className="p-4 space-y-8">
                    <section>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Account</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-zinc-900">
                            <SettingsItem icon={<User size={20} />} label="Edit Profile" />
                            <SettingsItem icon={<Shield size={20} />} label="Security & Privacy" />
                            <SettingsItem icon={<Bell size={20} />} label="Notifications" />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Preference</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-zinc-900">
                            <SettingsItem icon={<Eye size={20} />} label="Display & Theme" />
                        </div>
                    </section>

                    <section>
                        <div className="glass rounded-3xl overflow-hidden">
                            <button className="flex items-center gap-4 w-full p-4 text-rose-500 hover:bg-rose-500/10 transition-colors font-bold">
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function SettingsItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="flex items-center justify-between w-full p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="text-zinc-500">{icon}</div>
                <span className="font-medium">{label}</span>
            </div>
            <ChevronRight size={18} className="text-zinc-700" />
        </button>
    );
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
