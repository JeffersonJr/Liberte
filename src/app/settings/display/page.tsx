"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Moon, Sun, Type, Monitor } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { liberteGetProfile, liberteUpdateProfile } from "@/lib/liberte/profile";
import { useTheme } from "next-themes";

export default function DisplaySettingsPage() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [preferences, setPreferences] = useState({
        theme: 'dark',
        fontSize: 'medium',
        highContrast: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            loadPreferences();
        }
    }, [user]);

    async function loadPreferences() {
        try {
            const profile = await liberteGetProfile(user!.id);
            if (profile.preferences) {
                setPreferences({ ...preferences, ...profile.preferences });
            }
        } catch (error) {
            console.error("Error loading preferences:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function updatePreference(key: string, value: any) {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        try {
            await liberteUpdateProfile(user!.id, { preferences: newPrefs } as any);
            if (key === 'theme') {
                setTheme(value);
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    }

    if (isLoading || !mounted) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-2xl border-x border-border min-h-screen">
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
                    <Link href="/settings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-serif text-2xl font-bold tracking-tighter">Display & Theme</h1>
                </header>

                <div className="p-6 space-y-8">
                    {/* Theme Section */}
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Theme</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ThemeOption
                                icon={<Sun size={20} />}
                                label="Light"
                                active={theme === 'light'}
                                onClick={() => updatePreference('theme', 'light')}
                            />
                            <ThemeOption
                                icon={<Moon size={20} />}
                                label="Dark"
                                active={theme === 'dark'}
                                onClick={() => updatePreference('theme', 'dark')}
                            />
                            <ThemeOption
                                icon={<Monitor size={20} />}
                                label="System"
                                active={theme === 'system'}
                                onClick={() => updatePreference('theme', 'system')}
                            />
                        </div>
                    </section>

                    {/* Font Size */}
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Font Size</h2>
                        <div className="glass rounded-3xl p-4 flex items-center justify-between border border-border">
                            <div className="flex items-center gap-4">
                                <Type size={20} className="text-muted-foreground" />
                                <span className="font-bold">Text scale</span>
                            </div>
                            <div className="flex bg-foreground/5 rounded-xl p-1">
                                {['small', 'medium', 'large'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => updatePreference('fontSize', size)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${preferences.fontSize === size
                                            ? 'bg-foreground text-background shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Preview */}
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Preview</h2>
                        <div className="glass rounded-3xl p-6 border border-border">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-foreground/10" />
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-24 bg-foreground/10 rounded-full" />
                                        <div className="h-3 w-12 bg-foreground/5 rounded-full" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-3 w-full bg-foreground/5 rounded-full" />
                                        <div className="h-3 w-3/4 bg-foreground/5 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-center text-muted-foreground">
                            Theme changes are applied in real-time.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

function ThemeOption({ icon, label, active, onClick }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${active
                ? 'bg-foreground text-background border-foreground scale-105 shadow-xl shadow-foreground/5'
                : 'bg-foreground/5 text-muted-foreground border-border hover:border-foreground/30'
                }`}
        >
            {icon}
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}

