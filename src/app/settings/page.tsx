"use client";

import { motion } from "framer-motion";
import { ChevronLeft, User, Shield, Bell, Eye, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

import { useAuth } from "@/components/auth/AuthProvider";
import { seedMockData } from "@/lib/liberte/mockData";
import { useState } from "react";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeedData = async () => {
        if (!user) return;
        setIsSeeding(true);
        const result = await seedMockData(user.id);
        setIsSeeding(false);
        if (result.success) {
            alert("Mock data generated successfully! Refresh to see changes.");
        } else {
            alert("Error generating mock data. Check console.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-2xl border-x border-border min-h-screen">
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="sm:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-serif text-2xl font-bold tracking-tighter">Settings</h1>
                </header>

                <div className="p-4 space-y-8">
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Account</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border">
                            <SettingsItem icon={<User size={20} />} label="Edit Profile" href="/settings/profile" />
                            <SettingsItem icon={<Shield size={20} />} label="Security & Privacy" href="/settings/security" />
                            <SettingsItem icon={<Bell size={20} />} label="Notifications" href="/settings/notifications" />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Preference</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border">
                            <SettingsItem icon={<Eye size={20} />} label="Display & Theme" href="/settings/display" />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Development</h2>
                        <div className="glass rounded-3xl overflow-hidden">
                            <button
                                onClick={handleSeedData}
                                disabled={isSeeding}
                                className="flex items-center gap-4 w-full p-4 text-emerald-500 hover:bg-emerald-500/10 transition-colors font-bold disabled:opacity-50"
                            >
                                <PlusCircle size={20} /> {isSeeding ? "Generating..." : "Seed Mock Data"}
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className="glass rounded-3xl overflow-hidden">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-4 w-full p-4 text-rose-500 hover:bg-rose-500/10 transition-colors font-bold"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function SettingsItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <Link href={href} className="flex items-center justify-between w-full p-4 hover:bg-foreground/5 transition-colors">
            <div className="flex items-center gap-4">
                <div className="text-muted-foreground">{icon}</div>
                <span className="font-medium">{label}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground/30" />
        </Link>
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
